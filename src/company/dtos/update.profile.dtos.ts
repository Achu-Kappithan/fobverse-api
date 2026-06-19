import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContactItem } from '../schema/company.profile.schema';
import { UserRole } from '../../auth/schema/user.schema';
export class TeamMemberDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  role: string;
  @IsOptional()
  image?: string;
}
export class InternalUserDto {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  role: UserRole;
  @IsNotEmpty()
  name: string;
  @IsOptional()
  profileImg?: string;
}
export class UpdateInternalUserDto {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  name: string;
  @IsOptional()
  @IsNotEmpty()
  profileImg: string;
}
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  industry?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  officeLocation?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageGallery?: string[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InternalUserDto)
  internalUsers?: InternalUserDto[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
  @IsOptional()
  @IsString()
  logoUrl?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactItem)
  contactInfo?: ContactItem[];
}
export class changePassDto {
  @IsNotEmpty()
  @IsString()
  currPass: string;
  @IsNotEmpty()
  @IsString()
  newPass: string;
}
