import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum notificationType {
  SCHEDULED = 'SCHEDULED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
}

export type notificationDocument = HydratedDocument<notification>;

@Schema({ timestamps: true })
export class notification {
  @Prop({ required: true })
  candidateId: Types.ObjectId;

  @Prop({ required: true, enum: notificationType })
  notificationType: notificationType;

  @Prop({ required: true })
  tittle: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  meta?: {
    interviewId: Types.ObjectId;
    date: Date;
    time: string;
  };

  @Prop({ default: false })
  isRead: boolean;
}

export const notificationSchema = SchemaFactory.createForClass(notification);
