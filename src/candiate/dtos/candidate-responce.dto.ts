import { Expose, Type } from 'class-transformer';

class ContactInfoResponseDto {
  @Expose()
  phoneNumber?: string;

  @Expose()
  address?: string;

  @Expose()
  linkedIn?: string;

  @Expose()
  github?: string;
}

export class CandidateProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  adminUserId: string;

  @Expose()
  name: string;

  @Expose()
  isActive: boolean;

  @Expose()
  profileUrl?: string;

  @Expose()
  @Type(() => ContactInfoResponseDto)
  contactInfo?: ContactInfoResponseDto;

  @Expose()
  education?: string[];

  @Expose()
  skills?: string[];

  @Expose()
  experience?: string[];

  @Expose()
  resumeUrl?: string;

  @Expose()
  portfolioLinks?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
