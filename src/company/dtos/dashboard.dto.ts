import { Expose, Type } from 'class-transformer';
import { ApplicationResponseDto } from '../../applications/dtos/application.response';
import { ScheduleResponseDto } from '../../interview/dtos/interview.response.dto';

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
  @Type(() => ApplicationResponseDto)
  recentApplications: ApplicationResponseDto[];

  @Expose()
  @Type(() => ScheduleResponseDto)
  upcomingInterviews: ScheduleResponseDto[];

  @Expose()
  @Type(() => JobStatDto)
  jobStats: JobStatDto[];
}
