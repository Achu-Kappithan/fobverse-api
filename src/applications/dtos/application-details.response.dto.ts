import { Exclude, Expose, Type } from 'class-transformer';
import { Stages } from '../schema/applications.schema';
import {
  populatedcompanyId,
  ResponseJobsDto,
} from '../../jobs/dtos/responce.job.dto';

class ContactItemDto {
  @Expose()
  type: string;

  @Expose()
  value: string;
}

class CandidateProfileDetailsDto {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  aboutme: string | null;

  @Expose()
  profileUrl: string | null;

  @Expose()
  coverUrl: string | null;

  @Expose()
  @Type(() => ContactItemDto)
  contactInfo: ContactItemDto[];

  @Expose()
  education: string[];

  @Expose()
  skills: string[];

  @Expose()
  experience: string[];

  @Expose()
  resumeUrl: string | null;

  @Expose()
  portfolioLinks: string[];

  @Expose()
  isActive: boolean;
}

export class ApplicationDetailsResponseDto {
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
  updatedAt: string;

  @Expose()
  @Type(() => CandidateProfileDetailsDto)
  profile: CandidateProfileDetailsDto;

  @Expose()
  @Type(() => ResponseJobsDto)
  jobDetails: ResponseJobsDto;

  @Expose()
  @Type(() => populatedcompanyId)
  company: populatedcompanyId;

  @Exclude()
  _v: string;
}
