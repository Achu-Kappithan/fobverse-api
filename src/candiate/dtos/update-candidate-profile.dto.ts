

import {
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCandidateProfileDto } from './create-candidate-profile.dto';

class ContactInfoDto {
  @IsString()
  phoneNumber?: string;

  @IsString()
  address?: string;

  @IsString()
  linkedIn?: string;

  @IsString()
  github?: string;
}

export class UpdateCandidateProfileDto extends CreateCandidateProfileDto {
  @IsOptional()
  @IsString()
  profileUrl?: string;

  @IsOptional()
  @IsString()
  aboutme?:string

  @IsOptional()
  coverUrl?:string;

  @ValidateNested()
  @IsOptional()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  @IsOptional()
  education?: string[];

  @IsOptional()
  skills?: string[];
  
  @IsOptional()
  experience?: string[];

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  portfolioLinks?: string;
}
