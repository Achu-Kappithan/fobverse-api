import {
  PlainResponse,
  ApiResponse,
} from '../../shared/responses/api.response';
import { notificationResponseDto } from '../dtos/notification.response.dto';
export interface InotificationService {
  createInterviewScheduledNotification(
    candidateId: string,
    interview: { date: string; time: string },
  );
  createInterviewRescheduledNotification(
    candidateId: string,
    interview: { date: string; time: string },
  );
  createInterviewCancelledNotification(candidateId: string);
  createApplicationSubmittedNotification(candidateId: string, jobTitle: string);
  createApplicationShortlistedNotification(
    candidateId: string,
    jobTitle: string,
  );
  createApplicationRejectedNotification(candidateId: string, jobTitle: string);
  createInterviewPassedNotification(candidateId: string, stage: string);
  createInterviewFailedNotification(candidateId: string, stage: string);
  getCandidateNotifications(
    candidateId: string,
  ): Promise<ApiResponse<notificationResponseDto[]>>;
  getUnreadCount(candidateId: string): Promise<ApiResponse<{ count: number }>>;
  markAsRead(
    notificationId: string,
  ): Promise<ApiResponse<notificationResponseDto>>;
  markAllAsRead(candidateId: string): Promise<PlainResponse>;
}
export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';
