import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IApplicationService } from './interfaces/application.service.interface';
import {
  APPLICATION_REPOSITORY,
  IApplicationRepository,
} from './interfaces/application.repository.interface';
import { PlainResponse } from '../admin/interfaces/responce.interface';
import { CreateApplicationDto } from './dtos/createapplication.dto';
import { Types } from 'mongoose';
import { MESSAGES } from '../shared/constants/constants.messages';

@Injectable()
export class ApplicationsService implements IApplicationService {
  private readonly _logger = new Logger(ApplicationsService.name);
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly _applicationRepository: IApplicationRepository,
  ) {}

  async createApplication(
    dto: CreateApplicationDto,
    id: string,
  ): Promise<PlainResponse> {
    const jobid = new Types.ObjectId(dto.jobId);
    const candidateObjId = new Types.ObjectId(id);
    const updatedDto = { ...dto, candidateId: candidateObjId, jobId: jobid };

    this._logger.log(
      `[ApplicatonService] data  for applying  user ,${JSON.stringify(updatedDto)}`,
    );
    const application = await this._applicationRepository.findOne({
      candidateId: candidateObjId,
    });

    if (application) {
      const jobid: string = application.jobId.toString();
      if (jobid === dto.jobId) {
        throw new ConflictException(MESSAGES.APPLICATIONS.ALREDY_APPLYED);
      }
    }

    const data = await this._applicationRepository.create(updatedDto);
    console.log(data);
    if (!data) {
      throw new InternalServerErrorException(
        MESSAGES.APPLICATIONS.SUBMITION_FAILD,
      );
    }
    return {
      message: MESSAGES.APPLICATIONS.SUBMIT_APPLICATION,
    };
  }
}
