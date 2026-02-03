import { PlainResponse } from '../../admin/interfaces/responce.interface';
import { ApiResponce } from '../../shared/interface/api.responce';
import { notificationResponceDto } from '../dtos/notification.responce.dto';

export interface InotificationService {
  createInterviewScheduledNotification(
    candidateId: string,
    interview: { date: string; time: string },
  );

  createInterviewRescheduledNotification(candidateId: string, interview: any);

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
  ): Promise<ApiResponce<notificationResponceDto[]>>;

  getUnreadCount(candidateId: string): Promise<ApiResponce<{ count: number }>>;

  markAsRead(
    notificationId: string,
  ): Promise<ApiResponce<notificationResponceDto>>;

  markAllAsRead(candidateId: string): Promise<PlainResponse>;
}

export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';
