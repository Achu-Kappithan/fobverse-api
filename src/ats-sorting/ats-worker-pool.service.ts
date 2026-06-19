import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import * as path from 'path';
import { Worker } from 'worker_threads';
import type {
  AtsWorkerInput,
  AtsWorkerOutput,
} from './interfaces/ats.service.interface';
import {
  APPLICATION_REPOSITORY,
  IApplicationRepository,
} from '../applications/interfaces/application.repository.interface';
import { Stages } from '../applications/schema/applications.schema';

interface WorkerSlot {
  worker: Worker;
  busy: boolean;
  index: number;
}

interface PendingJob {
  input: AtsWorkerInput;
  resolve: () => void;
  reject: (err: Error) => void;
}

@Injectable()
export class AtsWorkerPoolService implements OnModuleInit, OnModuleDestroy {
  private readonly _logger = new Logger(AtsWorkerPoolService.name);
  private readonly _workerScriptPath: string;
  private readonly _poolSize: number;
  private readonly _pool: WorkerSlot[] = [];
  private readonly _queue: PendingJob[] = [];

  constructor(
    private readonly _configService: ConfigService,
    @Inject(APPLICATION_REPOSITORY)
    private readonly _applicationRepository: IApplicationRepository,
  ) {
    this._poolSize = this._configService.get<number>('ATS_WORKER_COUNT') ?? 2;
    this._workerScriptPath = path.resolve(__dirname, 'workers', 'ats.worker.js');
  }

  onModuleInit(): void {
    this._logger.log(
      `[AtsWorkerPool] Initialising ${this._poolSize} worker(s)`,
    );
    for (let i = 0; i < this._poolSize; i++) {
      this._spawnWorker(i);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this._logger.log('[AtsWorkerPool] Terminating all worker threads');
    await Promise.all(
      this._pool.map((slot) =>
        slot.worker.terminate().catch((err: unknown) => {
          this._logger.warn(
            `[AtsWorkerPool] Error terminating worker #${slot.index}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }),
      ),
    );
    this._pool.length = 0;
  }

  async runAtsJob(input: AtsWorkerInput): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const freeSlot = this._pool.find((s) => !s.busy);
      if (freeSlot) {
        this._dispatch(freeSlot, input);
        resolve();
      } else {
        this._logger.warn(
          `[AtsWorkerPool] All workers busy — queuing job for applicationId: ${input.applicationId}`,
        );
        this._queue.push({ input, resolve, reject });
      }
    });
  }

  private _spawnWorker(index: number): void {
    const worker = new Worker(this._workerScriptPath);
    const slot: WorkerSlot = { worker, busy: false, index };
    this._pool[index] = slot;

    worker.on('message', (output: AtsWorkerOutput) => {
      void this._handleWorkerResult(output);
      slot.busy = false;
      this._drainQueue(slot);
    });

    worker.on('error', (err: Error) => {
      this._logger.error(
        `[AtsWorkerPool] Worker #${index} error: ${err.message}`,
        err.stack,
      );
      slot.busy = false;
      this._drainQueue(slot);
    });

    worker.on('exit', (code: number) => {
      if (code !== 0) {
        this._logger.error(
          `[AtsWorkerPool] Worker #${index} exited with code ${code}. Restarting`,
        );
        this._spawnWorker(index);
      }
    });

    this._logger.log(`[AtsWorkerPool] Worker #${index} spawned`);
  }

  private _dispatch(slot: WorkerSlot, input: AtsWorkerInput): void {
    slot.busy = true;
    this._logger.log(
      `[AtsWorkerPool] Dispatching to worker #${slot.index} — applicationId: ${input.applicationId}`,
    );
    slot.worker.postMessage(input);
  }

  private _drainQueue(slot: WorkerSlot): void {
    const next = this._queue.shift();
    if (next) {
      this._dispatch(slot, next.input);
      next.resolve();
    }
  }

  private async _handleWorkerResult(output: AtsWorkerOutput): Promise<void> {
    if (!output.success) {
      this._logger.warn(
        `[AtsWorkerPool] Scoring failed for applicationId: ${output.applicationId} — ${output.error}`,
      );
      return;
    }

    const { applicationId, atsScore } = output;
    this._logger.log(
      `[AtsWorkerPool] Score: ${atsScore} for applicationId: ${applicationId}`,
    );

    try {
      const isShortlisted = atsScore >= 60;
      await this._applicationRepository.update(
        { _id: applicationId },
        {
          atsScore,
          Stages: isShortlisted ? Stages.Shortlisted : Stages.Default,
          Rejected: !isShortlisted,
        },
      );
      this._logger.log(
        `[AtsWorkerPool] DB updated — applicationId: ${applicationId}, shortlisted: ${isShortlisted}`,
      );
    } catch (err: unknown) {
      this._logger.error(
        `[AtsWorkerPool] DB update failed for applicationId: ${applicationId} — ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
