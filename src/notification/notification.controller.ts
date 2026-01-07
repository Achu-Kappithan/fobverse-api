import {
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  InotificationService,
  NOTIFICATION_SERVICE,
} from './interfaces/notification.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { Request as Erequest } from 'express';
import { ApiResponce } from '../shared/interface/api.responce';
import { notificationResponceDto } from './dtos/notification.responce.dto';

@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly _notificationService: InotificationService,
  ) {}

  @Get('getnotification')
  @UseGuards(AuthGuard('access_token'))
  async getCandidateNotification(
    @Request() req: Erequest,
  ): Promise<ApiResponce<notificationResponceDto[]>> {
    const user = req.user as { id: string };
    return await this._notificationService.getCandidateNotifications(user.id);
  }

  @Get('getunreadcount')
  @UseGuards(AuthGuard('access_token'))
  async getUnreadCount(
    @Request() req: Erequest,
  ): Promise<ApiResponce<{ count: number }>> {
    const user = req.user as { id: string };
    console.log('user data get from the jwt', user);

    return await this._notificationService.getUnreadCount(user.id);
  }

  @Patch(':id/markasread')
  @UseGuards(AuthGuard('access_token'))
  async markAsRead(@Param('id') notificationId: string) {
    console.log(notificationId);
    return this._notificationService.markAsRead(notificationId);
  }

  @Patch('markallread')
  @UseGuards(AuthGuard('access_token'))
  async markAllAsRead(@Request() req: Erequest) {
    const user = req.user as { id: string };
    return this._notificationService.markAllAsRead(user.id);
  }
}
