

import {
  IsArray,
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
  @IsString()
  profileUrl?: string;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  education?: string[];

  skills?: string[];

  experience?: string[];

  @IsString()
  resumeUrl?: string;

  @IsString()
  portfolioLinks?: string;
}
