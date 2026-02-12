import { ApiResponse } from '../../shared/responses/api.response';
import { CancelInterviewDto } from '../dtos/cancelInterview.dto';
import { ScheduleResponseDto } from '../dtos/interview.response.dto';
import {
  ScheduleInterviewDto,
  UpdateFeedbackDto,
  UpdateFinalResultDto,
} from '../dtos/interviewshedule.dto';
import { AllStagesResponseDto } from '../dtos/all-stages-response.dto';
import { ReviewStatus } from '../schema/interview.schema';

export interface IInterviewService {
  sheduleInterview(
    dto: ScheduleInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponse<ScheduleResponseDto>>;

  getStageDetails(
    applicationId: string,
    stage: string,
  ): Promise<ApiResponse<ScheduleResponseDto>>;

  getAllStagesByApplicationId(
    applicationId: string,
  ): Promise<ApiResponse<AllStagesResponseDto>>;

  updateFeedback(
    dto: UpdateFeedbackDto,
    interviewerId: string,
  ): Promise<ApiResponse<ScheduleResponseDto>>;

  reSheduleInterview(
    dto: ScheduleInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponse<ScheduleResponseDto>>;

  cancelIntterview(
    dto: CancelInterviewDto,
  ): Promise<ApiResponse<ScheduleResponseDto>>;

  updateFinalResult(
    dto: UpdateFinalResultDto,
    hrId: string,
  ): Promise<ApiResponse<ScheduleResponseDto>>;

  sheduleTelyInterview(
    dto: ScheduleInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponse<ScheduleResponseDto>>;

  reSheduleTelyInterview(
    dto: ScheduleInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponse<ScheduleResponseDto>>;

  getUserSchedules(
    userId: string,
    status?: ReviewStatus,
  ): Promise<ApiResponse<ScheduleResponseDto[]>>;
}

export const INTERVIEW_SERVICE = 'INTERVIEW_SERVICE';
