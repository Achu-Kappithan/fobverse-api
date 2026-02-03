import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { InterviewRepository } from './repository/interview.repository';
import { INTERVIEW_REPOSITORY } from './interfaces/interview.repository.interface';
import { INTERVIEW_SERVICE } from './interfaces/interview.service.interface';
import { MongooseModule } from '@nestjs/mongoose';
import { Interview, InterviewSchema } from './schema/interview.schema';
import { EmailModule } from '../email/email.module';
import { ApplicationsModule } from '../applications/applications.module';
import { NotificationModule } from '../notification/notification.module';
import { VideoCallGateway } from './videocall.gateway';
import {
  VideoCallRoom,
  VideoCallRoomSchema,
} from './schema/video-call-room.schema';
import { VideoCallRoomRepository } from './repository/video-call-room.repository';
import { VIDEO_CALL_ROOM_REPOSITORY } from './interfaces/video-call-room.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
      { name: VideoCallRoom.name, schema: VideoCallRoomSchema },
    ]),
    EmailModule,
    NotificationModule,
    ApplicationsModule,
  ],
  controllers: [InterviewController],
  providers: [
    {
      provide: INTERVIEW_REPOSITORY,
      useClass: InterviewRepository,
    },
    {
      provide: INTERVIEW_SERVICE,
      useClass: InterviewService,
    },
    {
      provide: VIDEO_CALL_ROOM_REPOSITORY,
      useClass: VideoCallRoomRepository,
    },
    VideoCallGateway,
  ],
  exports: [INTERVIEW_SERVICE, INTERVIEW_REPOSITORY],
})
export class InterviewModule {}
