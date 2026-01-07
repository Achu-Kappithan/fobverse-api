import { UpdateResult } from 'mongoose';
import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { notificationDocument } from '../schema/notification.schema';

export interface InotificationRepository
  extends IBaseRepository<notificationDocument> {
  findByRecipient(recipientId: string): Promise<notificationDocument[]>;

  findUnreadCount(recipientId: string): Promise<number>;

  markAsAllRead(candidateId: string): Promise<UpdateResult>;
}

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';
