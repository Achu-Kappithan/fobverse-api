import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { notification, notificationSchema } from './schema/notification.schema';
import { NOTIFICATION_SERVICE } from './interfaces/notification.service.interface';
import { NOTIFICATION_REPOSITORY } from './interfaces/notification.repository.interface';
import { notificationRepository } from './repository/notification.repository';
import { NotificationGateWay } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';

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
    NotificationGateWay,
    JwtService,
  ],
  exports: [NOTIFICATION_SERVICE],
})
export class NotificationModule {}
