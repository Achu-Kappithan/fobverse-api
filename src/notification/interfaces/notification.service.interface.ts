import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { notificationDocument } from '../schema/notification.schema';

export interface InotificationRepository
  extends IBaseRepository<notificationDocument> {}

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';
