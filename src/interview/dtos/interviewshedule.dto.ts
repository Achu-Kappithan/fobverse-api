import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { Stages } from '../../applications/schema/applications.schema';

export class interviewSheduleDto {
  @IsNotEmpty()
  hrName: string;

  @IsNotEmpty()
  stage: Stages;

  @IsNotEmpty()
  applicationId: string | Types.ObjectId;

  @IsNotEmpty()
  hrId: string | Types.ObjectId;

  @IsNotEmpty()
  scheduledDate: string;

  @IsNotEmpty()
  scheduledTime: string;

  @IsNotEmpty()
  userEmail: string;
}

export class updateFeedbackDto {
  @IsNotEmpty()
  applicationId: string;

  @IsNotEmpty()
  stage: string;

  @IsNotEmpty()
  feedback: string;

  @IsNotEmpty()
  status: string;
}
