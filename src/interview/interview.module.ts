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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
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
  ],
})
export class InterviewModule {}
