import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { InterviewDocument, ReviewStatus } from '../schema/interview.schema';

export interface IInterviewRepository
  extends IBaseRepository<InterviewDocument> {
  getStageDetails(
    applicationId: string,
    stage: string,
  ): Promise<InterviewDocument | null>;

  findAllByApplicationId(applicationId: string): Promise<InterviewDocument[]>;

  updateFeedback(
    appId: string,
    stage: string,
    data: any,
  ): Promise<InterviewDocument | null>;

  findSchedulesByInterviewer(
    interviewerId: string,
    status?: ReviewStatus,
  ): Promise<InterviewDocument[]>;
}

export const INTERVIEW_REPOSITORY = 'INTERVIEW_REPOSITORY';
