

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type CandidateProfileDocument = HydratedDocument<CandidateProfile>;

@Schema({ _id: false })
export class ContactInfo {
  @Prop()
  phoneNumber?: string;

  @Prop()
  address?: string;

  @Prop()
  linkedIn?: string;

  @Prop()
  github?: string;
}

@Schema({ timestamps: true })
export class CandidateProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  profileUrl?: string;

  @Prop({ type: ContactInfo, default: {} })
  contactInfo?: ContactInfo;

  @Prop({ type: [String], default: [] })
  education?: string[];

  @Prop({ type: [String], default: [] })
  skills?: string[];

  @Prop({ type: [String], default: [] })
  experience?: string[];

  @Prop()
  resumeUrl?: string;

  @Prop()
  portfolioLinks?: string;
}

export const CandidateProfileSchema = SchemaFactory.createForClass(CandidateProfile);
