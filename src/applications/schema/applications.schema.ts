import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApplicationDocument = HydratedDocument<Applications>;

@Schema({ timestamps: true })
export class Applications {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Jobs' })
  jobId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'CandidateProfile' })
  candidateId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: true })
  applicationStatus: boolean;

  @Prop({ required: true })
  qualification: string;

  @Prop({ required: true })
  experience: string;

  @Prop({ required: true })
  resumeUrl: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Applications);
