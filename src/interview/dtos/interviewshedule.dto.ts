import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Stages } from '../../applications/schema/applications.schema';

export class EvaluatorDto {
  @IsOptional()
  interviewerId?: string;

  @IsNotEmpty()
  @IsString()
  interviewerName: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsEnum(['Pass', 'Fail', 'Neutral', 'Pending'])
  result?: string;
}

export class ScheduleTelephoneInterviewDto {
  @IsNotEmpty()
  applicationId: string;

  @IsNotEmpty()
  @IsEnum(Stages)
  stage: Stages;

  @IsNotEmpty()
  userEmail: string;

  @IsNotEmpty()
  scheduledDate: string;

  @IsNotEmpty()
  scheduledTime: string;

  @IsNotEmpty()
  evaluator: EvaluatorDto;
}

export class ScheduleTechnicalInterviewDto {
  @IsNotEmpty()
  applicationId: string;

  @IsNotEmpty()
  @IsEnum(Stages)
  stage: Stages;

  @IsNotEmpty()
  userEmail: string;

  @IsNotEmpty()
  scheduledDate: string;

  @IsNotEmpty()
  scheduledTime: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluatorDto)
  evaluators: EvaluatorDto[];

  @IsOptional()
  meetingLink?: string;
}

export class UpdateFeedbackDto {
  @IsNotEmpty()
  interviewId: string;

  @IsNotEmpty()
  feedback: string;

  @IsEnum(['Pass', 'Fail', 'Neutral'])
  result: string;

  @IsOptional()
  @IsString()
  overallFeedback?: string;
}
