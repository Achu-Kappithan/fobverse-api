import { FilterQuery, UpdateResult } from 'mongoose';
import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { ApplicationDocument } from '../schema/applications.schema';
import {
  populatedapplicationList,
  CandidateApplicationAggregation,
} from '../types/repository.types';
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

  updateAtsScore(ids: string[], minScore: number): Promise<UpdateResult>;

  getApplicationDetails(appId: string): Promise<populatedapplicationList>;

  getCandidateApplications(
    candidateId: string,
    filter: {
      search?: string;
      filtervalue?: string;
    },
    options: {
      limit?: number;
      skip?: number;
      sort?: Record<string, -1 | 1>;
    },
  ): Promise<{ data: CandidateApplicationAggregation[]; total: number }>;
}
export const APPLICATION_REPOSITORY = 'APPLICATION_REPOSITORY';
