import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
import { PlainResponse } from '../admin/interfaces/responce.interface';

@Injectable()
export class NotificationService implements InotificationService {
  logger = new Logger(NotificationService.name);
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly _notificationRepository: InotificationRepository,
    private readonly _notificationGateway: NotificationGateWay,
  ) {}

  async createInterviewScheduledNotification(
    candidateId: string,
    interview: { date: string; time: string },
  ) {
    const candidateObjId = new Types.ObjectId(candidateId);
    const notification = await this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.SCHEDULED,
      title: 'Interview Scheduled',
      message: `Your interview has been scheduled`,
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
    const notification = await this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.CANCELLED,
      title: 'Interview Cancelled',
      message: `Your interview has been cancelled`,
    });
    this._notificationGateway.sendNotificationToCandidate(
      candidateId,
      notification,
    );
    return notification;
  }

  async createApplicationSubmittedNotification(
    candidateId: string,
    jobTitle: string,
  ) {
    const candidateObjId = new Types.ObjectId(candidateId);
    const notification = await this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.APPLICATION_SUBMITTED,
      title: 'Application Submitted',
      message: `Your application for ${jobTitle} has been submitted successfully`,
    });
    this._notificationGateway.sendNotificationToCandidate(
      candidateId,
      notification,
    );
    return notification;
  }

  async createApplicationShortlistedNotification(
    candidateId: string,
    jobTitle: string,
  ) {
    const candidateObjId = new Types.ObjectId(candidateId);
    const notification = await this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.APPLICATION_SHORTLISTED,
      title: 'Application Shortlisted',
      message: `Congratulations! Your application for ${jobTitle} has been shortlisted`,
    });
    this._notificationGateway.sendNotificationToCandidate(
      candidateId,
      notification,
    );
    return notification;
  }

  async createApplicationRejectedNotification(
    candidateId: string,
    jobTitle: string,
  ) {
    const candidateObjId = new Types.ObjectId(candidateId);
    const notification = await this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.APPLICATION_REJECTED,
      title: 'Application Update',
      message: `Thank you for your interest in the ${jobTitle} position. Unfortunately, we will not be moving forward with your application at this time`,
    });
    this._notificationGateway.sendNotificationToCandidate(
      candidateId,
      notification,
    );
    return notification;
  }

  async createInterviewPassedNotification(candidateId: string, stage: string) {
    const candidateObjId = new Types.ObjectId(candidateId);
    const notification = await this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.INTERVIEW_PASSED,
      title: 'Interview Update',
      message: `Great news! You have cleared the ${stage} interview`,
    });
    this._notificationGateway.sendNotificationToCandidate(
      candidateId,
      notification,
    );
    return notification;
  }

  async createInterviewFailedNotification(candidateId: string, stage: string) {
    const candidateObjId = new Types.ObjectId(candidateId);
    const notification = await this._notificationRepository.create({
      candidateId: candidateObjId,
      notificationType: notificationType.INTERVIEW_FAILED,
      title: 'Interview Update',
      message: `Thank you for completing the ${stage} interview. We regret to inform you that we will not be moving forward with your candidacy`,
    });
    this._notificationGateway.sendNotificationToCandidate(
      candidateId,
      notification,
    );
    return notification;
  }

  async getCandidateNotifications(
    candidateId: string,
  ): Promise<ApiResponce<notificationResponceDto[]>> {
    const data =
      await this._notificationRepository.findByRecipient(candidateId);
    const plaindata = data.map((val) => {
      const obj = val.toObject();
      return {
        ...obj,
        _id: obj._id.toString(),
        candidateId: obj.candidateId.toString(),
      };
    });

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

  async markAsRead(
    notificationId: string,
  ): Promise<ApiResponce<notificationResponceDto>> {
    const data = await this._notificationRepository.update(
      { _id: notificationId },
      {
        isRead: true,
      },
    );
    const mappedData = plainToInstance(notificationResponceDto, {
      ...data,
      _id: data?._id.toString(),
      candidateId: data?.candidateId.toString(),
    });
    return {
      message: MESSAGES.NOTIFICATION.UPDATED,
      data: mappedData,
    };
  }

  async markAllAsRead(candidateId: string): Promise<PlainResponse> {
    const result =
      await this._notificationRepository.markAsAllRead(candidateId);
    console.log('all read updation result', result);

    if (!result.acknowledged) {
      throw new InternalServerErrorException();
    }
    return {
      message: MESSAGES.NOTIFICATION.UPDATED,
    };
  }
}
