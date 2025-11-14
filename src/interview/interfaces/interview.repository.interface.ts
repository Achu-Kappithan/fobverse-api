import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { InterviewDocument } from '../schema/interview.schema';

export interface IInterviewRepository
  extends IBaseRepository<InterviewDocument> {
  getStageDetails(
    applicationId: string,
    stage: string,
  ): Promise<InterviewDocument | null>;

  updateFeedback(
    appId: string,
    stage: string,
    data: any,
  ): Promise<InterviewDocument | null>;
}

export const INTERVIEW_REPOSITORY = 'INTERVIEW_REPOSITORY';
