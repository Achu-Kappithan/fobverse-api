import { Expose } from 'class-transformer';
import { notificationType } from '../schema/notification.schema';

export class notificationResponceDto {
  @Expose()
  _id: string;
  @Expose()
  candidateId: string;
  @Expose()
  notificationType: notificationType;
  @Expose()
  tittle: string;
  @Expose()
  message: string;
  @Expose()
  meta?: {
    date?: string;
    time?: string;
  };
  @Expose()
  isRead: boolean;
}
