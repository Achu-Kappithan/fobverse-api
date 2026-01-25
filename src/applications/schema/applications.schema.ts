import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum Stages {
  Default = 'default',
  Shortlisted = 'shortlisted',
  Telephone = 'telephone',
  Technical = 'technical_analysis',
  Hired = 'hired',
}

export type ApplicationDocument = HydratedDocument<Applications>;

@Schema({ timestamps: true })
export class Applications {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Jobs' })
  jobId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  candidateId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'CompanyProfile' })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, default: 0 })
  atsScore: number;

  @Prop({ default: 60 })
  atsCriteria: number;

  @Prop({ enum: Stages, default: Stages.Default })
  Stages: Stages;

  @Prop({ default: false })
  Rejected: boolean;

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

// Indexes for performance optimization
ApplicationSchema.index({ candidateId: 1 });
ApplicationSchema.index({ candidateId: 1, Stages: 1 });
