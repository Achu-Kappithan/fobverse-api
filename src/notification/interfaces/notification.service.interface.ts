import { ApiResponce } from '../../shared/interface/api.responce';
import { notificationResponceDto } from '../dtos/notification.responce.dto';

export interface InotificationService {
  createInterviewRescheduledNotification(candidateId: string, interview: any);

  createInterviewCancelledNotification(
    candidateId: string,
    interviewId: string,
  );

  getCandidateNotifications(
    candidateId: string,
  ): Promise<ApiResponce<notificationResponceDto[]>>;

  getUnreadCount(candidateId: string): Promise<ApiResponce<{ count: number }>>;

  markAsRead(notificationId: string);
}

export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';
