import { ApiResponce } from '../../shared/interface/api.responce';
import { ScheduleResponseDto } from '../dtos/interview.responce.dto';
import { interviewSheduleDto } from '../dtos/interviewshedule.dto';

export interface IInterviewService {
  sheduleInterview(
    dto: interviewSheduleDto,
  ): Promise<ApiResponce<ScheduleResponseDto>>;
}

export const INTERVIEW_SERVICE = 'INTERVIEW_SERVICE';
