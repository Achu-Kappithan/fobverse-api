import { Expose, Type } from 'class-transformer';

export class JobTypeStats {
  @Expose()
  fulltime: number;

  @Expose()
  parttime: number;

  @Expose()
  remote: number;

  @Expose()
  onsite: number;

  @Expose()
  internship: number;

  @Expose()
  contract: number;
}

export class RecentJobDto {
  @Expose()
  _id: string;

  @Expose()
  title: string;

  @Expose()
  companyName: string;

  @Expose()
  location: string;

  @Expose()
  jobType: string;

  @Expose()
  applicantsCount: number;

  @Expose()
  logo: string;
}

export class AdminDashboardDto {
  @Expose()
  totalCandidates: number;

  @Expose()
  totalCompanies: number;

  @Expose()
  totalApplications: number;

  @Expose()
  totalJobs: number;

  @Expose()
  activeJobs: number;

  @Expose()
  @Type(() => JobTypeStats)
  jobTypeStats: JobTypeStats;

  @Expose()
  @Type(() => RecentJobDto)
  recentJobs: RecentJobDto[];
}
