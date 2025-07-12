import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create.profile.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class TeamMember {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  image?: string;
}



export class InternalUser {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  role: string;

  @IsNotEmpty()
  name: string;

  profilePic?: string;
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
  teamMembers?: TeamMember[];

  @IsOptional()
  internalUsers?: InternalUser[];

  @IsOptional()
  benafits?:string[]

  @IsOptional()
  logoUrl?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  contactInfo?: { type: string; value: string }[];

}






