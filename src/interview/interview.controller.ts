import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  IInterviewService,
  INTERVIEW_SERVICE,
} from './interfaces/interview.service.interface';
import { AuthGuard } from '@nestjs/passport';
import {
  ScheduleInterviewDto,
  UpdateFeedbackDto,
  UpdateFinalResultDto,
} from './dtos/interviewshedule.dto';
import { ApiResponse } from '../shared/responses/api.response';
import { ScheduleResponseDto } from './dtos/interview.response.dto';
import { CancelInterviewDto } from './dtos/cancelInterview.dto';
import { Request as ERequest } from 'express';
import { AllStagesResponseDto } from './dtos/all-stages-response.dto';
import { ReviewStatus } from './schema/interview.schema';

@Controller('interview')
export class InterviewController {
  constructor(
    @Inject(INTERVIEW_SERVICE)
    private readonly _interviewService: IInterviewService,
  ) {}
  @Post('shedule')
  @UseGuards(AuthGuard('access_token'))
  async sheduleInterview(
    @Body() dto: ScheduleInterviewDto,
    @Request() req: ERequest,
  ) {
    const scheduledBy = req.user as { id: string };
    return await this._interviewService.sheduleInterview(dto, scheduledBy.id);
  }

  @Post('telephone/shedule')
  @UseGuards(AuthGuard('access_token'))
  async sheduleTelyInterview(
    @Body() dto: ScheduleInterviewDto,
    @Request() req: ERequest,
  ) {
    const scheduledBy = req.user as { id: string };
    return await this._interviewService.sheduleTelyInterview(
      dto,
      scheduledBy.id,
    );
  }

  @Put('reshedule')
  @UseGuards(AuthGuard('access_token'))
  async reSheduleInterview(
    @Body() dto: ScheduleInterviewDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<ScheduleResponseDto>> {
    const scheduledBy = req.user as { id: string };
    return this._interviewService.reSheduleTelyInterview(dto, scheduledBy.id);
  }

  @Put('telephone/reshedule')
  @UseGuards(AuthGuard('access_token'))
  async reSheduleTelyInterview(
    @Body() dto: ScheduleInterviewDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<ScheduleResponseDto>> {
    const scheduledBy = req.user as { id: string };
    return this._interviewService.reSheduleInterview(dto, scheduledBy.id);
  }

  @Patch('cancelinterview')
  @UseGuards(AuthGuard('access_token'))
  async cancelInterview(
    @Body() dto: CancelInterviewDto,
  ): Promise<ApiResponse<ScheduleResponseDto>> {
    return this._interviewService.cancelIntterview(dto);
  }

  @Get('getstagedetails')
  @UseGuards(AuthGuard('access_token'))
  async getStageDetails(
    @Query('applicationId') applicationId: string,
    @Query('stage') stage: string,
  ): Promise<ApiResponse<ScheduleResponseDto>> {
    return await this._interviewService.getStageDetails(applicationId, stage);
  }

  @Get('all-stages')
  @UseGuards(AuthGuard('access_token'))
  async getAllStages(
    @Query('applicationId') applicationId: string,
  ): Promise<ApiResponse<AllStagesResponseDto>> {
    return await this._interviewService.getAllStagesByApplicationId(
      applicationId,
    );
  }

  @Post('updatefeedback')
  @UseGuards(AuthGuard('access_token'))
  async updateFeedback(
    @Body() data: UpdateFeedbackDto,
    @Request() req: ERequest,
  ): Promise<ApiResponse<ScheduleResponseDto>> {
    const interviewer = req.user as { id: string };
    return this._interviewService.updateFeedback(data, interviewer.id);
  }

  @Post('finalize-result')
  @UseGuards(AuthGuard('access_token'))
  async updateFinalResult(
    @Body() dto: UpdateFinalResultDto,

    @Request() req: ERequest,
  ): Promise<ApiResponse<ScheduleResponseDto>> {
    const hrId = req.user as { id: string };
    return this._interviewService.updateFinalResult(dto, hrId.id);
  }

  @Get('my-schedules')
  @UseGuards(AuthGuard('access_token'))
  async getMySchedules(
    @Query('status') status: ReviewStatus | undefined,
    @Request() req: ERequest,
  ): Promise<ApiResponse<ScheduleResponseDto[]>> {
    const user = req.user as { id: string };
    return this._interviewService.getUserSchedules(user.id, status);
  }
}
