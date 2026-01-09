import { Exclude, Expose, Type } from 'class-transformer';

class PanelDto {
  @Expose()
  interviewerName: string;

  @Expose()
  feedback?: string;

  @Expose()
  result: string;
}

export class ScheduleResponseDto {
  @Expose()
  _id: string;

  @Exclude()
  applicationId: string;

  @Exclude()
  scheduledBy: string;

  @Expose()
  userEmail: string;

  @Expose()
  stage: string;

  @Expose()
  scheduledDate: string;

  @Expose()
  scheduledTime: string;

  @Expose()
  meetingLink?: string;

  @Expose()
  status: string;

  @Expose()
  @Type(() => PanelDto)
  evaluators: PanelDto[];

  @Expose()
  overallFeedback?: string;

  @Expose()
  finalResult?: string;
}
