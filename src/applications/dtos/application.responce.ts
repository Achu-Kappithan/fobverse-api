import { Exclude, Expose, Type } from 'class-transformer';
import { Stages } from '../schema/applications.schema';
import { ResponseJobsDto } from '../../jobs/dtos/responce.job.dto';

class ApplicationProfileDto {
  @Expose()
  _id: string | null;

  @Expose()
  profileImg: string | null;
}

export class ApplicationResponceDto {
  @Expose()
  _id: string;

  @Exclude()
  companyId: string;

  @Expose()
  candidateId: string;

  @Expose()
  name: string;

  @Expose()
  Stages: Stages;

  @Expose()
  Rejected: boolean;

  @Expose()
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
  @Type(() => ApplicationProfileDto)
  profile: ApplicationProfileDto;

  @Expose()
  updatedAt: string;

  @Expose()
  @Type(() => ResponseJobsDto)
  jobDetails: ResponseJobsDto;

  @Exclude()
  _v: string;
}
