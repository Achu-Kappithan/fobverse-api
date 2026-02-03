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
  ScheduleInterviewDto,
  UpdateFeedbackDto,
  UpdateFinalResultDto,
} from './dtos/interviewshedule.dto';
import { IInterviewService } from './interfaces/interview.service.interface';
import { Types } from 'mongoose';
import { ApiResponce } from '../shared/interface/api.responce';
import { ScheduleResponseDto } from './dtos/interview.responce.dto';
import { AllStagesResponseDto } from './dtos/all-stages-response.dto';
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
import {
  IVideoCallRoomRepository,
  VIDEO_CALL_ROOM_REPOSITORY,
} from './interfaces/video-call-room.repository.interface';
import { VideoCallRoomDocument } from './schema/video-call-room.schema';
import { randomUUID } from 'crypto';
import { Stages } from '../applications/schema/applications.schema';

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
    @Inject(VIDEO_CALL_ROOM_REPOSITORY)
    private readonly _videoCallRoomRepository: IVideoCallRoomRepository,
    private readonly _EmailService: EmailService,
  ) {}

  async sheduleInterview(
    dto: ScheduleInterviewDto,
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

    const evaluators = dto.evaluators.map((ev) => ({
      interviewerId: ev.interviewerId
        ? new Types.ObjectId(ev.interviewerId)
        : undefined,
      interviewerName: ev.interviewerName,
    }));

    const roomId = randomUUID();
    const videoRoom: VideoCallRoomDocument =
      await this._videoCallRoomRepository.create({
        roomId,
        interviewId: applicationObjId,
        participants: [],
        isActive: true,
      });

    const updatedDto = {
      applicationId: applicationObjId,
      scheduledBy: scheduledByObjId,
      userEmail: dto.userEmail,
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      meetingLink: `/video-interview/${roomId}`,
      videoRoomId: videoRoom._id,
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

    const application = await this._applicationService.getjobDetails(
      dto.applicationId,
      '',
    );
    const candidateId = application.data?.candidateId;
    if (candidateId) {
      await this._notificationService.createInterviewScheduledNotification(
        candidateId,
        { date: dto.scheduledDate, time: dto.scheduledTime },
      );
    }

    return {
      message: MESSAGES.INTERVIEW.SHEDULE,
      data: mappedData,
    };
  }

  async sheduleTelyInterview(
    dto: ScheduleInterviewDto,
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

    const evaluators = dto.evaluators.map((ev) => ({
      interviewerId: ev.interviewerId
        ? new Types.ObjectId(ev.interviewerId)
        : undefined,
      interviewerName: ev.interviewerName,
    }));

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

    const application = await this._applicationService.getjobDetails(
      dto.applicationId,
      '',
    );
    const candidateId = application.data?.candidateId;
    if (candidateId) {
      await this._notificationService.createInterviewScheduledNotification(
        candidateId,
        { date: dto.scheduledDate, time: dto.scheduledTime },
      );
    }

    return {
      message: MESSAGES.INTERVIEW.SHEDULE,
      data: mappedData,
    };
  }

  async reSheduleInterview(
    dto: ScheduleInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    this.logger.log(
      `[interviewService] data get in the frondend for resheduling interview ${JSON.stringify(dto)}`,
    );
    const applicationObjId = new Types.ObjectId(dto.applicationId);
    const scheduledByObjId = new Types.ObjectId(scheduledBy);

    const evaluators = dto.evaluators.map((ev) => ({
      interviewerId: ev.interviewerId
        ? new Types.ObjectId(ev.interviewerId)
        : undefined,
      interviewerName: ev.interviewerName,
    }));

    const filter = {
      applicationId: applicationObjId,
      stage: dto.stage,
    };
    const existingInterview = await this._interviewRepository.getStageDetails(
      dto.applicationId.toString(),
      dto.stage,
    );

    let meetingLink = dto.meetingLink;
    let videoRoomId = existingInterview?.videoRoomId;

    if (!videoRoomId) {
      const roomId = randomUUID();
      const videoRoom: VideoCallRoomDocument =
        await this._videoCallRoomRepository.create({
          roomId,
          interviewId: applicationObjId,
          participants: [],
          isActive: true,
        });
      meetingLink = `/video-interview/${roomId}`;
      videoRoomId = videoRoom._id;
    }

    const updatedDto = {
      applicationId: applicationObjId,
      scheduledBy: scheduledByObjId,
      userEmail: dto.userEmail,
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      meetingLink,
      videoRoomId,
      evaluators,
      status: ReviewStatus.Rescheduled,
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

    const application = await this._applicationService.getjobDetails(
      dto.applicationId,
      '',
    );
    const candidateId = application.data?.candidateId;
    if (candidateId) {
      await this._notificationService.createInterviewRescheduledNotification(
        candidateId,
        { date: dto.scheduledDate, time: dto.scheduledTime },
      );
    }

    return {
      message: MESSAGES.INTERVIEW.RE_SHEDULE,
      data: mappedData,
    };
  }

  async reSheduleTelyInterview(
    dto: ScheduleInterviewDto,
    scheduledBy: string,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    this.logger.log(
      `[interviewService] data get in the frondend for resheduling interview ${JSON.stringify(dto)}`,
    );
    const applicationObjId = new Types.ObjectId(dto.applicationId);
    const scheduledByObjId = new Types.ObjectId(scheduledBy);

    const evaluators = dto.evaluators.map((ev) => ({
      interviewerId: ev.interviewerId
        ? new Types.ObjectId(ev.interviewerId)
        : undefined,
      interviewerName: ev.interviewerName,
    }));

    const filter = {
      applicationId: applicationObjId,
      stage: dto.stage,
    };
    const existingInterview = await this._interviewRepository.getStageDetails(
      dto.applicationId.toString(),
      dto.stage,
    );

    this.logger.log(
      `[interview_service] existing inteviewData  fetchend : ${JSON.stringify(existingInterview)}`,
    );

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

    const application = await this._applicationService.getjobDetails(
      dto.applicationId,
      '',
    );
    const candidateId = application.data?.candidateId;
    if (candidateId) {
      await this._notificationService.createInterviewRescheduledNotification(
        candidateId,
        { date: dto.scheduledDate, time: dto.scheduledTime },
      );
    }

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

    const application = await this._applicationService.getjobDetails(
      dto.applicationId,
      '',
    );
    const candidateId = application.data?.candidateId;
    if (candidateId) {
      await this._notificationService.createInterviewCancelledNotification(
        candidateId,
      );
    }

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

    const plainData = data.toObject ? data.toObject() : data;

    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...plainData,
      _id: plainData._id.toString(),
      applicationId: plainData.applicationId?.toString(),
      scheduledBy: plainData.scheduledBy?.toString(),
      evaluators: plainData.evaluators?.map((evaluator) => ({
        ...evaluator,
        interviewerId: evaluator.interviewerId?.toString(),
      })),
    });

    return {
      message: MESSAGES.INTERVIEW.STAGE_GET,
      data: mappedData,
    };
  }

  async getAllStagesByApplicationId(
    applicationId: string,
  ): Promise<ApiResponce<AllStagesResponseDto>> {
    this.logger.log(
      `[interviewService] Fetching all stages for applicationId: ${applicationId}`,
    );

    const atsStageResponse = await this._applicationService.getjobDetails(
      applicationId,
      '',
    );

    const interviews =
      await this._interviewRepository.findAllByApplicationId(applicationId);

    let shortlistedStage: ScheduleResponseDto | null = null;
    let techStage: ScheduleResponseDto | null = null;

    interviews.forEach((interview) => {
      const plainData = interview.toObject ? interview.toObject() : interview;

      const mappedInterview = plainToInstance(ScheduleResponseDto, {
        ...plainData,
        _id: plainData._id.toString(),
        applicationId: plainData.applicationId?.toString(),
        scheduledBy: plainData.scheduledBy?.toString(),
        evaluators: plainData.evaluators?.map((evaluator) => ({
          ...evaluator,
          interviewerId: evaluator.interviewerId?.toString(),
        })),
      });

      if (interview.stage === Stages.Shortlisted) {
        shortlistedStage = mappedInterview;
      } else if (interview.stage === Stages.Technical) {
        techStage = mappedInterview;
      }
    });

    const allStagesData: AllStagesResponseDto = {
      atsStage: atsStageResponse.data,
      shortlistedStage,
      techStage,
    };

    this.logger.log(
      `[interviewService] Successfully fetched all stages for applicationId: ${applicationId}`,
    );

    return {
      message: 'All stages fetched successfully',
      data: allStagesData,
    };
  }

  async updateFeedback(
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
      throw new NotFoundException('Unautharized person for updateFeedback');
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

  async updateFinalResult(
    dto: UpdateFinalResultDto,
    hrId: string,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const interview = await this._interviewRepository.findById(dto.interviewId);

    if (!interview) {
      throw new NotFoundException(MESSAGES.INTERVIEW.FAILD_GET);
    }

    if (interview.scheduledBy.toHexString() !== hrId) {
      throw new ConflictException('Unautharized Person for updation');
    }

    interview.finalResult = dto.finalResult;
    interview.overallFeedback = dto.finalFeedback;
    interview.status = ReviewStatus.Completed;

    const updatedInterview = await interview.save();

    const updatedApplication = await this._applicationService.updateStatus(
      dto.applicationId,
      dto.nextStage,
      dto.finalResult,
    );

    if (!updatedApplication) {
      throw new InternalServerErrorException(
        MESSAGES.INTERVIEW.UPDATE_STATUS_FAILD,
      );
    }

    const application = await this._applicationService.getjobDetails(
      dto.applicationId,
      '',
    );
    const candidateId = application.data.candidateId;
    const companyName = application.data.company?.name || 'the company';

    if (candidateId) {
      if (dto.finalResult === finalResult.Pass) {
        await this._notificationService.createInterviewPassedNotification(
          candidateId,
          updatedInterview.stage,
        );
        await this._EmailService.SendInterviewPassedEmail(
          application.data.email,
          updatedInterview.stage,
          companyName,
        );
      } else {
        await this._notificationService.createInterviewFailedNotification(
          candidateId,
          updatedInterview.stage,
        );
        await this._EmailService.SendInterviewFailedEmail(
          application.data.email,
          updatedInterview.stage,
          companyName,
        );
      }
    }

    const mappedData = plainToInstance(ScheduleResponseDto, {
      ...updatedInterview.toObject(),
      _id: updatedInterview._id.toString(),
      scheduledBy: updatedInterview.scheduledBy.toString(),
      applicationId: updatedInterview.applicationId.toString(),
    });

    return {
      message: MESSAGES.INTERVIEW.FEEDBACK_UPDATED,
      data: mappedData,
    };
  }

  async getUserSchedules(
    userId: string,
    status?: ReviewStatus,
  ): Promise<ApiResponce<ScheduleResponseDto[]>> {
    this.logger.log(
      `[interviewService] Fetching schedules for user: ${userId}, status: ${status || 'all'}`,
    );

    const interviews =
      await this._interviewRepository.findSchedulesByInterviewer(
        userId,
        status,
      );

    const mappedData = interviews.map((interview) => {
      const interviewObj = interview.toObject();

      const application = interviewObj.applicationId as unknown as {
        _id: Types.ObjectId;
        name: string;
        candidateId: Types.ObjectId;
        jobId: {
          _id: Types.ObjectId;
          title: string;
        };
      };

      return plainToInstance(ScheduleResponseDto, {
        ...interviewObj,
        _id: interviewObj._id.toString(),
        applicationId:
          application?._id?.toString() ||
          (interviewObj.applicationId instanceof Types.ObjectId
            ? interviewObj.applicationId.toString()
            : undefined),
        candidateName: application?.name,
        jobTitle: application?.jobId?.title,
        jobId: application?.jobId?._id?.toString(),
        candidateId: application?.candidateId?.toString(),
        scheduledBy: interviewObj.scheduledBy?.toString(),
        evaluators: interviewObj.evaluators?.map((evaluator) => ({
          ...evaluator,
          interviewerId: evaluator.interviewerId?.toString(),
        })),
      });
    });

    this.logger.log(
      `[interviewService] Successfully fetched ${mappedData.length} schedules for user: ${userId}`,
    );

    return {
      message: 'User schedules fetched successfully',
      data: mappedData,
    };
  }
}
