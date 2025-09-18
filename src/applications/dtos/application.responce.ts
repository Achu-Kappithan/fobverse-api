import { Exclude, Expose } from 'class-transformer';
import { Stages } from '../schema/applications.schema';

export class ApplicationResponceDto {
  @Expose()
  _id: string;

  @Exclude()
  compannyId: string;

  @Expose()
  candidateId: string;

  @Expose()
  name: string;

  @Expose()
  Stages: Stages;

  @Expose()
  Rejected: boolean;

  @Exclude()
  jobId: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  qualification: string;

  @Expose()
  atsScore: number;

  @Expose()
  atsCriteria: number;

  @Expose()
  experience: string;

  @Expose()
  resumeUrl: string;

  @Expose()
  createdAt: string;

  @Expose()
  profile: string;

  @Exclude()
  _v: string;
}
