import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  IInterviewService,
  INTERVIEW_SERVICE,
} from './interfaces/interview.service.interface';
import { AuthGuard } from '@nestjs/passport';
import { interviewSheduleDto } from './dtos/interviewshedule.dto';

@Controller('interview')
export class InterviewController {
  constructor(
    @Inject(INTERVIEW_SERVICE)
    private readonly interviewService: IInterviewService,
  ) {}
  @Post('shedule')
  @UseGuards(AuthGuard('access_token'))
  async sheduleInterview(@Body() dto: interviewSheduleDto) {
    return await this.interviewService.sheduleInterview(dto);
  }
}
