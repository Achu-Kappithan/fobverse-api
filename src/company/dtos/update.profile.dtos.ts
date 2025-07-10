import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create.profile.dto';

export class UpdateCompanyProfileDto extends PartialType(CreateProfileDto) {
  industry?: string;

  contactInfo?: string[];

  officeLocation?: string[];

  techStack?: string[];

  location?: string;

  logoUrl?: string;

  description?: string;

  isActive?: boolean;
}
