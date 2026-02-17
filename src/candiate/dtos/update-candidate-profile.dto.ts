import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ContactItem } from '../schema/candidate.profile.schema';

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  profileUrl?: string;
  @IsOptional()
  aboutme?: string;
  @IsOptional()
  coverUrl?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactItem)
  contactInfo?: ContactItem[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  experience?: string[];
  @IsOptional()
  @IsString()
  resumeUrl?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioLinks?: string[];
}
