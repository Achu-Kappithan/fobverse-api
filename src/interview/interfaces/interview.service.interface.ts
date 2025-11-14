import { ApiResponce } from '../../shared/interface/api.responce';
import { ScheduleResponseDto } from '../dtos/interview.responce.dto';
import {
  interviewSheduleDto,
  updateFeedbackDto,
} from '../dtos/interviewshedule.dto';

export interface IInterviewService {
  sheduleInterview(
    dto: interviewSheduleDto,
  ): Promise<ApiResponce<ScheduleResponseDto>>;

  getStageDetails(
    applicationId: string,
    stage: string,
  ): Promise<ApiResponce<ScheduleResponseDto>>;

  updateFeedback(
    dto: updateFeedbackDto,
  ): Promise<ApiResponce<ScheduleResponseDto>>;
}

export const INTERVIEW_SERVICE = 'INTERVIEW_SERVICE';
