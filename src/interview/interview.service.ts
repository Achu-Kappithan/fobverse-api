import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  IInterviewRepository,
  INTERVIEW_REPOSITORY,
} from './interfaces/interview.repository.interface';
import {
  interviewSheduleDto,
  updateFeedbackDto,
} from './dtos/interviewshedule.dto';
import { IInterviewService } from './interfaces/interview.service.interface';
import { Types } from 'mongoose';
import { ApiResponce } from '../shared/interface/api.responce';
import { ScheduleResponseDto } from './dtos/interview.responce.dto';
import { plainToInstance } from 'class-transformer';
import { MESSAGES } from '../shared/constants/constants.messages';
import { EmailService } from '../email/email.service';
import {
  APPLICATION_SERVICE,
  IApplicationService,
} from '../applications/interfaces/application.service.interface';
import { Stages } from '../applications/schema/applications.schema';

@Injectable()
export class InterviewService implements IInterviewService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private readonly _interviewRepository: IInterviewRepository,
    @Inject(APPLICATION_SERVICE)
    private readonly _applicationService: IApplicationService,
    private readonly _EmailService: EmailService,
  ) {}

  async sheduleInterview(
    dto: interviewSheduleDto,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const currentData = await this._interviewRepository.getStageDetails(
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
    const data = await this._interviewRepository.create(updatedDto);
    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...data.toJSON(),
      _id: data._id.toString(),
      hrId: data.hrId.toString(),
    });
    console.log(mappedData);
    await this._EmailService.SendInterviewSheduledEmail(
      dto.userEmail,
      mappedData,
    );

    return {
      message: MESSAGES.INTERVIEW.SHEDULE,
      data: mappedData,
    };
  }

  async getStageDetails(
    applicationId: string,
    stage: string,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const data = await this._interviewRepository.getStageDetails(
      applicationId,
      stage,
    );

    if (!data) {
      throw new InternalServerErrorException(MESSAGES.INTERVIEW.FAILD_GET);
    }

    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...data?.toJSON(),
      _id: data._id.toString(),
      hrId: data.hrId.toString(),
    });

    return {
      message: MESSAGES.INTERVIEW.STAGE_GET,
      data: mappedData,
    };
  }

  async updateFeedback(
    dto: updateFeedbackDto,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const newdata = {
      overallFeedback: dto.feedback,
      finalResult: dto.status,
      status: 'Completed',
    };

    const data = await this._interviewRepository.updateFeedback(
      dto.applicationId,
      dto.stage,
      newdata,
    );

    if (!data) {
      throw new NotFoundException(
        'Interview not found for the provided application and stage',
      );
    }

    const applicationUpdate = await this._applicationService.updateStatus(
      dto.applicationId,
      Stages.Technical,
      dto.status,
    );

    console.log(applicationUpdate);

    if (!applicationUpdate) {
      throw new InternalServerErrorException(
        'Failed to update application stage',
      );
    }

    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...data?.toJSON(),
      _id: data?._id.toString(),
      hrId: data?.hrId.toString(),
    });
    return {
      message: MESSAGES.INTERVIEW.FEEDBACK_UPDATED,
      data: mappedData,
    };
  }
}
