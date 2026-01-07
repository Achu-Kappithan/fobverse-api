import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/repositories/base.repository';
import {
  notification,
  notificationDocument,
} from '../schema/notification.schema';
import { InotificationRepository } from '../interfaces/notification.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateResult } from 'mongoose';

@Injectable()
export class notificationRepository
  extends BaseRepository<notificationDocument>
  implements InotificationRepository
{
  constructor(
    @InjectModel(notification.name)
    private readonly notificationModel: Model<notificationDocument>,
  ) {
    super(notificationModel);
  }

  async findByRecipient(recipientId: string): Promise<notificationDocument[]> {
    const candidateObjId = new Types.ObjectId(recipientId);
    return await this.notificationModel
      .find({ candidateId: candidateObjId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUnreadCount(recipientId: string): Promise<number> {
    const CandidateObjId = new Types.ObjectId(recipientId);
    return await this.notificationModel.countDocuments({
      candidateId: CandidateObjId,
      isRead: false,
    });
  }

  async markAsAllRead(candidateId: string): Promise<UpdateResult> {
    const candidateObjId = new Types.ObjectId(candidateId);
    return this.notificationModel.updateMany(
      { candidateId: candidateObjId },
      { isRead: true },
    );
  }
}
