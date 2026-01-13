import { ApiResponce } from '../../shared/interface/api.responce';
import { CancelInterviewDto } from '../dtos/cancelInterview.dto';
import { ScheduleResponseDto } from '../dtos/interview.responce.dto';
import {
  ScheduleInterviewDto,
  UpdateFeedbackDto,
  UpdateFinalResultDto,
} from '../dtos/interviewshedule.dto';

export interface IInterviewService {
  sheduleInterview(
    dto: ScheduleInterviewDto,
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

  reSheduleInterview(
    dto: ScheduleInterviewDto,
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
