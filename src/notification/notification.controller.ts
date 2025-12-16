import { Controller, Inject } from '@nestjs/common';
import {
  InotificationService,
  NOTIFICATION_SERVICE,
} from './interfaces/notification.repository.interface';

@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly _notificationService: InotificationService,
  ) {}
}
