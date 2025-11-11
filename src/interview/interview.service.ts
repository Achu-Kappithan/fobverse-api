import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  IInterviewRepository,
  INTERVIEW_REPOSITORY,
} from './interfaces/interview.repository.interface';
import { interviewSheduleDto } from './dtos/interviewshedule.dto';
import { IInterviewService } from './interfaces/interview.service.interface';
import { Types } from 'mongoose';
import { ApiResponce } from '../shared/interface/api.responce';
import { ScheduleResponseDto } from './dtos/interview.responce.dto';
import { plainToInstance } from 'class-transformer';
import { MESSAGES } from '../shared/constants/constants.messages';
import { EmailService } from '../email/email.service';

@Injectable()
export class InterviewService implements IInterviewService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private readonly interviewRepository: IInterviewRepository,
    private readonly EmailService: EmailService,
  ) {}

  async sheduleInterview(
    dto: interviewSheduleDto,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const currentData = await this.interviewRepository.getStageDetails(
      dto.applicationId.toString(),
      dto.stage,
    );

    if (currentData) {
      throw new ConflictException(MESSAGES.INTERVIEW.SHEDULED);
    }

    const applicationObjId = new Types.ObjectId(dto.applicationId);
    const hrObjectId = new Types.ObjectId(dto.hrId);
    const updatedDto = {
      ...dto,
      applicationId: applicationObjId,
      hrId: hrObjectId,
    };
    const data = await this.interviewRepository.create(updatedDto);
    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...data.toJSON(),
      _id: data._id.toString(),
      hrId: data.hrId.toString(),
    });
    console.log(mappedData);
    await this.EmailService.SendInterviewSheduledEmail(
      dto.userEmail,
      mappedData,
    );

    return {
      message: MESSAGES.INTERVIEW.SHEDULE,
      data: mappedData,
    };
  }
}
