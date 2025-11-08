import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { InterviewDocument } from '../schema/interview.schema';

export interface IInterviewRepository
  extends IBaseRepository<InterviewDocument> {}

export const INTERVIEW_REPOSITORY = 'INTERVIEW_REPOSITORY';
