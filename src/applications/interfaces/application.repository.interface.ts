import { FilterQuery } from 'mongoose';
import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { ApplicationDocument } from '../schema/applications.schema';
import { populatedapplicationList } from '../types/repository.types';
export interface IApplicationRepository
  extends IBaseRepository<ApplicationDocument> {
  populatedApplicationList(
    filter: FilterQuery<ApplicationDocument>,
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, -1 | 1>;
      projection?: any;
    },
  ): Promise<{ data: populatedapplicationList[]; total: number }>;
}
export const APPLICATION_REPOSITORY = 'APPLICATION_REPOSITORY';
