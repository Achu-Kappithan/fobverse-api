import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { notification, notificationSchema } from './schema/notification.schema';
import { NOTIFICATION_SERVICE } from './interfaces/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from './interfaces/notification.service.interface';
import { notificationRepository } from './repository/notification.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: notification.name, schema: notificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: NOTIFICATION_SERVICE,
      useClass: NotificationService,
    },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: notificationRepository,
    },
  ],
  exports: [NOTIFICATION_SERVICE],
})
export class NotificationModule {}
