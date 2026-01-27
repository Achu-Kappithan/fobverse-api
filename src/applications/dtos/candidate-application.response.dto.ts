import { Expose } from 'class-transformer';
import { Stages } from '../schema/applications.schema';

export class CandidateApplicationResponseDto {
  @Expose()
  _id: string;

  @Expose()
  applicationStatus: boolean;

  @Expose()
  Stages: Stages;

  @Expose()
  Rejected: boolean;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  companyName: string;

  @Expose()
  companyLogo: string | null;

  @Expose()
  jobRole: string;

  @Expose()
  jobLocation: string[];

  @Expose()
  jobType: string;

  @Expose()
  atsScore: number;

  @Expose()
  resumeUrl: string;

  @Expose()
  jobId: string;

  @Expose()
  companyId: string;
}
