import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
} from 'class-validator';
import { CreateProfileDto } from './create.profile.dto';

export class UpdateCompanyProfileDto extends PartialType(CreateProfileDto) {
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsArray()
  contactInfo?: string[];

  @IsOptional()
  @IsArray()
  officeLocation?: string[];

  @IsOptional()
  @IsArray()
  techStack?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
