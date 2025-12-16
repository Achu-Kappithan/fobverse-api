import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/repositories/base.repository';
import {
  notification,
  notificationDocument,
} from '../schema/notification.schema';
import { InotificationRepository } from '../interfaces/notification.service.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class notificationRepository
  extends BaseRepository<notificationDocument>
  implements InotificationRepository
{
  constructor(
    @InjectModel(notification.name)
    private readonly notificatonModel: Model<notificationDocument>,
  ) {
    super(notificatonModel);
  }
}
