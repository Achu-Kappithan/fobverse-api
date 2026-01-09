import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  IInterviewRepository,
  INTERVIEW_REPOSITORY,
} from './interfaces/interview.repository.interface';
import {
  EvaluatorDto,
  ScheduleTelephoneInterviewDto,
  UpdateFeedbackDto,
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
import { finalResult, ReviewStatus } from './schema/interview.schema';
import { CancelInterviewDto } from './dtos/cancelInterview.dto';
import {
  InotificationService,
  NOTIFICATION_SERVICE,
} from '../notification/interfaces/notification.service.interface';

@Injectable()
export class InterviewService implements IInterviewService {
  logger = new Logger(InterviewService.name);
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private readonly _interviewRepository: IInterviewRepository,
    @Inject(APPLICATION_SERVICE)
    private readonly _applicationService: IApplicationService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly _notificationService: InotificationService,
    private readonly _EmailService: EmailService,
  ) {}

  async sheduleTelyInterview(
    dto: ScheduleTelephoneInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    this.logger.log(
      `[interviewService] data get in the frondend for sheduling interview ${JSON.stringify(dto)}`,
    );
    const currentData = await this._interviewRepository.getStageDetails(
      dto.applicationId.toString(),
      dto.stage,
    );

    if (currentData) {
      throw new ConflictException(MESSAGES.INTERVIEW.SHEDULED);
    }

    const applicationObjId = new Types.ObjectId(dto.applicationId);
    const scheduledByObjId = new Types.ObjectId(scheduledBy);
    const evaluatorObj = dto.evaluator[0] as EvaluatorDto;

    const evaluators = [
      {
        interviewerId: evaluatorObj.interviewerId
          ? new Types.ObjectId(evaluatorObj.interviewerId)
          : undefined,
        interviewerName: evaluatorObj.interviewerName,
      },
    ];

    const updatedDto = {
      applicationId: applicationObjId,
      scheduledBy: scheduledByObjId,
      userEmail: dto.userEmail,
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      evaluators,
    };

    const data = await this._interviewRepository.create(updatedDto);
    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...data.toJSON(),
      _id: data._id.toString(),
      scheduledBy: data.scheduledBy.toString(),
      applicationId: data.applicationId.toString(),
    });
    await this._EmailService.SendInterviewEmail(
      dto.userEmail,
      mappedData,
      'Scheduled',
    );

    return {
      message: MESSAGES.INTERVIEW.SHEDULE,
      data: mappedData,
    };
  }

  async reSheduleTelyInterview(
    dto: ScheduleTelephoneInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    this.logger.log(
      `[interviewService] data get in the frondend for resheduling interview ${JSON.stringify(dto)}`,
    );
    const applicationObjId = new Types.ObjectId(dto.applicationId);
    const scheduledByObjId = new Types.ObjectId(scheduledBy);
    const evaluatorObj = dto.evaluator[0] as EvaluatorDto;

    const evaluators = [
      {
        interviewerId: evaluatorObj.interviewerId
          ? new Types.ObjectId(evaluatorObj.interviewerId)
          : undefined,
        interviewerName: evaluatorObj.interviewerName,
      },
    ];

    const updatedDto = {
      applicationId: applicationObjId,
      scheduledBy: scheduledByObjId,
      userEmail: dto.userEmail,
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      evaluators,
      status: ReviewStatus.Rescheduled,
    };
    const filter = {
      applicationId: applicationObjId,
      stage: dto.stage,
    };
    const data = await this._interviewRepository.update(filter, updatedDto);
    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...data!.toJSON(),
      _id: data!._id.toString(),
      scheduledBy: data!.scheduledBy.toString(),
      applicationId: data?.applicationId.toString(),
    });
    await this._EmailService.SendInterviewEmail(
      dto.userEmail,
      mappedData,
      'Rescheduled',
    );

    return {
      message: MESSAGES.INTERVIEW.RE_SHEDULE,
      data: mappedData,
    };
  }

  async cancelIntterview(
    dto: CancelInterviewDto,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const applicationObjId = new Types.ObjectId(dto.applicationId);
    const filter = {
      applicationId: applicationObjId,
      stage: dto.stage,
    };

    const data = await this._interviewRepository.update(filter, {
      status: ReviewStatus.Cancelled,
      finalResult: finalResult.Fail,
    });

    if (!data) {
      throw new InternalServerErrorException('Cannot Update  the status');
    }

    const udpatedStatus = await this._applicationService.updateStatus(
      dto.applicationId,
    );

    if (!udpatedStatus) {
      throw new InternalServerErrorException(
        MESSAGES.INTERVIEW.UPDATE_STATUS_FAILD,
      );
    }

    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...data.toJSON(),
      _id: data._id.toString(),
      scheduledBy: data.scheduledBy.toString(),
      applicationId: data.applicationId.toString(),
    });
    await this._EmailService.SendInterviewCancelledEmail(
      dto.userEmail,
      mappedData,
    );

    return {
      message: MESSAGES.INTERVIEW.CANCEL_INTERVIEW,
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
      scheduledBy: data.scheduledBy.toString(),
    });

    return {
      message: MESSAGES.INTERVIEW.STAGE_GET,
      data: mappedData,
    };
  }

  async updateTelyFeedback(
    dto: UpdateFeedbackDto,
    interviewerId: string,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const interview = await this._interviewRepository.findById(dto.interviewId);

    if (!interview) {
      throw new NotFoundException(MESSAGES.INTERVIEW.FAILD_GET);
    }

    const evaluatorIndex = interview.evaluators.findIndex(
      (evaluator) => evaluator.interviewerId?.toString() === interviewerId,
    );

    if (evaluatorIndex === -1) {
      throw new NotFoundException('Evaluator not found in this interview');
    }

    interview.evaluators[evaluatorIndex].feedback = dto.feedback;
    interview.evaluators[evaluatorIndex].result = dto.result;

    const updatedInterview = await interview.save();

    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...updatedInterview?.toJSON(),
      _id: updatedInterview?._id.toString(),
      scheduledBy: updatedInterview?.scheduledBy.toString(),
      applicationId: updatedInterview.applicationId.toString(),
    });

    return {
      message: MESSAGES.INTERVIEW.FEEDBACK_UPDATED,
      data: mappedData,
    };
  }
}
