import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { InterviewRepository } from './repository/interview.repository';
import { INTERVIEW_REPOSITORY } from './interfaces/interview.repository.interface';
import { INTERVIEW_SERVICE } from './interfaces/interview.service.interface';

@Module({
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
