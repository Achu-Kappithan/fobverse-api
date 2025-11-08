import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Stages } from '../../applications/schema/applications.schema';

export type InterviewDocument = HydratedDocument<Interview>;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Applications' })
  applicationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  hrId: Types.ObjectId;

  @Prop({ required: true })
  hrName: string;

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
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled',
  })
  status: string;

  @Prop({
    type: [
      {
        interviewerId: { type: Types.ObjectId, ref: 'User', required: false },
        interviewerName: { type: String, required: true },
        feedback: { type: String },
        result: {
          type: String,
          enum: ['Pass', 'Fail', 'Neutral', 'Pending'],
          default: 'Pending',
        },
      },
    ],
    default: [],
  })
  panel: {
    interviewerId?: Types.ObjectId;
    interviewerName: string;
    feedback?: string;
    result?: string;
  }[];

  @Prop()
  overallFeedback?: string;

  @Prop({ enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' })
  finalResult?: string;
}

export const InteviewSchema = SchemaFactory.createForClass(Interview);
