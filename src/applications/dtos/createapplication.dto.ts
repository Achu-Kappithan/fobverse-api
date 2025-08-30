import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateApplicationDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  jobId: string | Types.ObjectId;

  @IsOptional()
  candidateId: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @IsString()
  qualification: string;

  @IsNotEmpty()
  @IsString()
  experience: string;

  @IsString()
  @IsOptional()
  resumeUrl?: string;
}
