import { ApiResponce } from '../../shared/interface/api.responce';
import { CancelInterviewDto } from '../dtos/cancelInterview.dto';
import { ScheduleResponseDto } from '../dtos/interview.responce.dto';
import {
  ScheduleTelephoneInterviewDto,
  UpdateFeedbackDto,
  UpdateFinalResultDto,
} from '../dtos/interviewshedule.dto';

export interface IInterviewService {
  sheduleTelyInterview(
    dto: ScheduleTelephoneInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponce<ScheduleResponseDto>>;

  getStageDetails(
    applicationId: string,
    stage: string,
  ): Promise<ApiResponce<ScheduleResponseDto>>;

  updateTelyFeedback(
    dto: UpdateFeedbackDto,
    interviewerId: string,
  ): Promise<ApiResponce<ScheduleResponseDto>>;

  reSheduleTelyInterview(
    dto: ScheduleTelephoneInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponce<ScheduleResponseDto>>;

  cancelIntterview(
    dto: CancelInterviewDto,
  ): Promise<ApiResponce<ScheduleResponseDto>>;

  updateFinalResult(
    dto: UpdateFinalResultDto,
    hrId: string,
  ): Promise<ApiResponce<ScheduleResponseDto>>;
}

export const INTERVIEW_SERVICE = 'INTERVIEW_SERVICE';
