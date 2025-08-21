import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum jobType {
  FullTime = 'fulltime',
  PartTmime = 'parttime',
  Remote = 'remote',
  OnSite = 'onsite',
}

export type JobsDocument = HydratedDocument<Jobs>;

@Schema({ timestamps: true })
export class Jobs {
  @Prop({ type: Types.ObjectId, ref: 'CompanyProfile', required: true })
  companyId: Types.ObjectId | { _id: Types.ObjectId; name: string };

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  responsibility: string;

  @Prop({ required: true, enum: Object.values(jobType) })
  jobType: jobType;

  @Prop({ type: [String], required: true })
  skills: string[];

  experience?: string[];

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    _id: false,
    required: true,
  })
  salary: { min: number; max: number };

  @Prop({ required: true })
  location: string[];

  @Prop({ required: true })
  vacancies: string;

  @Prop({ required: true })
  dueDate: string;

  @Prop({ default: true })
  activeStatus: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Jobs);
