import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Stages } from '../../applications/schema/applications.schema';

export enum ReviewStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rescheduled = 'Rescheduled',
}

export enum finalResult {
  Fail = 'Fail',
  Pass = 'Pass',
  Pending = 'Pending',
}

@Schema({ _id: false })
class Evaluator {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  interviewerId?: Types.ObjectId;

  @Prop({ required: true })
  interviewerName: string;

  @Prop()
  feedback?: string;

  @Prop({
    type: String,
    enum: ['Pass', 'Fail', 'Neutral', 'Pending'],
    default: 'Pending',
  })
  result?: string;
}

export type InterviewDocument = HydratedDocument<Interview>;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Applications' })
  applicationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  scheduledBy: Types.ObjectId;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true, enum: Stages })
  stage: Stages;

  @Prop({ required: true })
  scheduledDate: string;

  @Prop({ required: true })
  scheduledTime: string;

  @Prop()
  meetingLink?: string;

  @Prop({
    required: true,
    enum: ReviewStatus,
    default: ReviewStatus.Scheduled,
  })
  status: string;

  @Prop({ type: [Evaluator], default: [] })
  evaluators: Evaluator[];

  @Prop()
  overallFeedback?: string;

  @Prop({ enum: finalResult, default: finalResult.Pending })
  finalResult?: string;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
