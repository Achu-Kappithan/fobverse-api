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
import { ApiResponce } from '../shared/interface/api.responce';
import { ScheduleResponseDto } from './dtos/interview.responce.dto';
import { CancelInterviewDto } from './dtos/cancelInterview.dto';
import { Request as ERequest } from 'express';

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

  @Put('reshedule')
  @UseGuards(AuthGuard('access_token'))
  async reSheduleInterview(
    @Body() dto: ScheduleInterviewDto,
    @Request() req: ERequest,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const scheduledBy = req.user as { id: string };
    return this._interviewService.reSheduleInterview(dto, scheduledBy.id);
  }

  @Patch('cancelinterview')
  @UseGuards(AuthGuard('access_token'))
  async cancelInterview(
    @Body() dto: CancelInterviewDto,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    return this._interviewService.cancelIntterview(dto);
  }

  @Get('getstagedetails')
  @UseGuards(AuthGuard('access_token'))
  async getStageDetails(
    @Query('applicationId') applicationId: string,
    @Query('stage') stage: string,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    return await this._interviewService.getStageDetails(applicationId, stage);
  }

  @Post('updatefeedback')
  @UseGuards(AuthGuard('access_token'))
  async updateFeedback(
    @Body() data: UpdateFeedbackDto,
    @Request() req: ERequest,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const interviewer = req.user as { id: string };
    return this._interviewService.updateFeedback(data, interviewer.id);
  }

  @Post('finalize-result')
  @UseGuards(AuthGuard('access_token'))
  async updateFinalResult(
    @Body() dto: UpdateFinalResultDto,

    @Request() req: ERequest,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    const hrId = req.user as { id: string };
    return this._interviewService.updateFinalResult(dto, hrId.id);
  }
}
