import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class InterviewService implements IInterviewService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private readonly interviewRepository: IInterviewRepository,
  ) {}

  async sheduleInterview(
    dto: interviewSheduleDto,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const applicationObjId = new Types.ObjectId(dto.applicationId);
    const hrObjectId = new Types.ObjectId(dto.hrId);
    const updatedDto = {
      ...dto,
      applicationId: applicationObjId,
      hrId: hrObjectId,
    };
    const data = await this.interviewRepository.create(updatedDto);
    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...data,
      _id: data._id.toString(),
      hrId: data.hrId.toString(),
    });

    return {
      message: MESSAGES.INTERVIEW.SHEDULE,
      data: mappedData,
    };
  }
}
