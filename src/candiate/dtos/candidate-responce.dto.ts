import { Exclude, Expose, Type } from 'class-transformer';


export class CandidateProfileResponseDto {
  @Expose()
  id: string;

  @Exclude()
  UserId: string;

  @Expose()
  name: string;

  @Expose()
  aboutme:string

  @Expose()
  isActive: boolean;

  @Expose()
  profileUrl?: string;

  @Expose()
  coverUrl?:string;

  @Expose()
  contactInfo?: { type: string; value: string }[];

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
