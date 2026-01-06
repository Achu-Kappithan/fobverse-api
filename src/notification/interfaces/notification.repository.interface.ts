import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { notificationDocument } from '../schema/notification.schema';

export interface InotificationRepository
  extends IBaseRepository<notificationDocument> {
  findByRecipient(recipientId: string): Promise<notificationDocument[]>;

  findUnreadCount(recipientId: string): Promise<number>;
}

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';
