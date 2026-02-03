import { Expose, Type } from 'class-transformer';
import { ApplicationResponceDto } from '../../applications/dtos/application.responce';
import { ScheduleResponseDto } from '../../interview/dtos/interview.responce.dto';

export class DashboardStatsDto {
  @Expose()
  totalJobs: number;

  @Expose()
  activeJobs: number;

  @Expose()
  totalApplications: number;

  @Expose()
  pendingApplications: number;

  @Expose()
  hiredCandidates: number;

  @Expose()
  interviewsScheduled: number;
}

export class JobStatDto {
  @Expose()
  jobId: string;

  @Expose()
  jobTitle: string;

  @Expose()
  applicationCount: number;

  @Expose()
  active: boolean;
}

export class DashboardResponseDto {
  @Expose()
  @Type(() => DashboardStatsDto)
  stats: DashboardStatsDto;

  @Expose()
  @Type(() => ApplicationResponceDto)
  recentApplications: ApplicationResponceDto[];

  @Expose()
  @Type(() => ScheduleResponseDto)
  upcomingInterviews: ScheduleResponseDto[];

  @Expose()
  @Type(() => JobStatDto)
  jobStats: JobStatDto[];
}
