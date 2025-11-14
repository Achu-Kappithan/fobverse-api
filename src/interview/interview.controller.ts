import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
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
  interviewSheduleDto,
  updateFeedbackDto,
} from './dtos/interviewshedule.dto';
import { ApiResponce } from '../shared/interface/api.responce';
import { ScheduleResponseDto } from './dtos/interview.responce.dto';

@Controller('interview')
export class InterviewController {
  constructor(
    @Inject(INTERVIEW_SERVICE)
    private readonly _interviewService: IInterviewService,
  ) {}
  @Post('shedule')
  @UseGuards(AuthGuard('access_token'))
  async sheduleInterview(@Body() dto: interviewSheduleDto) {
    return await this._interviewService.sheduleInterview(dto);
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
    @Body() data: updateFeedbackDto,
  ): Promise<ApiResponce<ScheduleResponseDto>> {
    return this._interviewService.updateFeedback(data);
  }
}
