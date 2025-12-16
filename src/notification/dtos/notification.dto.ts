import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { notificationType } from '../schema/notification.schema';
import { Types } from 'mongoose';

export class NotificationDto {
  @IsNotEmpty()
  candidateId: string;

  @IsEnum(notificationType)
  type: notificationType;

  @IsNotEmpty()
  tittle: string;

  @IsNotEmpty()
  message: string;

  @IsOptional()
  meta?: {
    interviewId: Types.ObjectId;
    date: Date;
    time: string;
  };
}
