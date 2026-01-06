import { Inject, Injectable, Logger } from '@nestjs/common';
import { InotificationService } from './interfaces/notification.service.interface';
import {
  InotificationRepository,
  NOTIFICATION_REPOSITORY,
} from './interfaces/notification.repository.interface';
import { notificationType } from './schema/notification.schema';
import { Types } from 'mongoose';
import { NotificationGateWay } from './notification.gateway';
import { ApiResponce } from '../shared/interface/api.responce';
import { MESSAGES } from '../shared/constants/constants.messages';
import { plainToInstance } from 'class-transformer';
import { notificationResponceDto } from './dtos/notification.responce.dto';

@Injectable()
export class NotificationService implements InotificationService {
  logger = new Logger(NotificationService.name);
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly _notificationRepository: InotificationRepository,
    private readonly _notificationGateway: NotificationGateWay,
  ) {}

  async createInterviewRescheduledNotification(
    candidateId: string,
    interview: { date: string; time: string },
  ) {
    this.logger.log(
      `[notificationService] data for resheduling notification ${candidateId} ${JSON.stringify(interview)}`,
    );
    const candidateObjId = new Types.ObjectId(candidateId);
    const notification = await this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.RESCHEDULED,
      title: 'Interview Rescheduled',
      message: `Your interview has been rescheduled`,
      meta: {
        date: interview.date,
        time: interview.time,
      },
    });
    this._notificationGateway.sendNotificationToCandidate(
      candidateId,
      notification,
    );
    return notification;
  }

  async createInterviewCancelledNotification(candidateId: string) {
    const candidateObjId = new Types.ObjectId(candidateId);
    return this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.CANCELLED,
      title: 'Interview Cancelled',
      message: `Your interview has been cancelled`,
    });
  }

  async getCandidateNotifications(
    candidateId: string,
  ): Promise<ApiResponce<notificationResponceDto[]>> {
    const data =
      await this._notificationRepository.findByRecipient(candidateId);
    const plaindata = data.map((val) => ({
      ...val,
      _id: val._id.toString(),
      candidateId: val.candidateId.toString(),
    }));

    const mappedData = plainToInstance(notificationResponceDto, plaindata, {
      excludeExtraneousValues: true,
    });

    return {
      message: MESSAGES.NOTIFICATION.FETCH_NOTIFICATIONS,
      data: mappedData,
    };
  }

  async getUnreadCount(
    candidateId: string,
  ): Promise<ApiResponce<{ count: number }>> {
    const data =
      await this._notificationRepository.findUnreadCount(candidateId);
    return {
      message: MESSAGES.NOTIFICATION.FETCH_UNREAD_COUNT,
      data: { count: data },
    };
  }

  markAsRead(notificationId: string) {
    return this._notificationRepository.update(
      { _id: notificationId },
      {
        isRead: true,
      },
    );
  }
}
