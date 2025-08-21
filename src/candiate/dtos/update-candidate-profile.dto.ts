import { IsOptional, IsString } from 'class-validator';

export class UpdateCandidateProfileDto {
  @IsString()
  name: string;

  @IsOptional()
  profileUrl?: string;

  @IsOptional()
  aboutme?: string;

  @IsOptional()
  coverUrl?: string;

  @IsOptional()
  contactInfo?: { type: string; value: string }[];

  @IsOptional()
  education?: string[];

  @IsOptional()
  skills?: string[];

  @IsOptional()
  experience?: string[];

  @IsOptional()
  resumeUrl?: string;

  @IsOptional()
  portfolioLinks?: string;
}
