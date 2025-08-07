import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type JobsDocument = HydratedDocument<Jobs>

@Schema({ timestamps: true })
export class Jobs {
  @Prop({ type: Types.ObjectId, ref: 'CompanyProfile', required: true, unique: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  skills: string[];

  @Prop({ type: [String], required: true })
  experience: string[];

  @Prop({
    type: { min: Number,max: Number },
    required: true,
  })
  salary: { min: number ,max: number};

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  vacancies: number;
}

export const JobSchema = SchemaFactory.createForClass(Jobs);
