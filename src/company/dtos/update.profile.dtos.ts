import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create.profile.dto';
import { isNotEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/auth/schema/user.schema';


export class TeamMemberDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  image?: string;
}



export class InternalUserDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  role: UserRole

  @IsNotEmpty()
  name: string;

  @IsOptional()
  profileImg?: string;
}

export class UpdateInternalUserDto {
  @IsNotEmpty()
  email:string

  @IsNotEmpty()
  name:string

  @IsOptional()
  @IsNotEmpty()
  profileImg:string
}


export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  name: string;

  @IsOptional()
  industry?: string;

  @IsOptional()
  officeLocation?: string[];

  @IsOptional()
  techStack?: string[];

  @IsOptional()
  imageGallery?:string[]

  @IsOptional()
  teamMembers?: TeamMemberDto[];

  @IsOptional()
  internalUsers?: InternalUserDto[];

  @IsOptional()
  benafits?:string[]

  @IsOptional()
  logoUrl?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  contactInfo?: { type: string; value: string }[];

}


export class changePassDto {

  @IsNotEmpty()
  @IsString()
  currPass:string

  @IsNotEmpty()
  @IsString()
  newPass:string
}






