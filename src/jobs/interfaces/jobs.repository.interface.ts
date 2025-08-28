import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { JobsDocument } from '../schema/jobs.schema';
import { FilterQuery, UpdateResult } from 'mongoose';
import { populatedJobDetails } from '../types/repository.types';

export interface IJobsRepository extends IBaseRepository<JobsDocument> {
  UpdatejobStatus(id: string): Promise<UpdateResult>;

  findAllJobs(
    filter?: FilterQuery<JobsDocument>,
    Options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
      projection?: any;
    },
  ): Promise<{ data: JobsDocument[]; total: number }>;

  publicJobView(id: string): Promise<populatedJobDetails>;
}

export const JOBS_REPOSITORY = 'JOBS_REPOSITORY';
