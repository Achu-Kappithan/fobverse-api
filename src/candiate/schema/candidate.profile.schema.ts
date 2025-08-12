

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false }) 
export class ContactItem {
  @Prop({ required: true })
  type: string;
  @Prop({ required: true })
  value: string; 
}

export const ContactItemSchema = SchemaFactory.createForClass(ContactItem);

export type CandidateProfileDocument = HydratedDocument<CandidateProfile>;


@Schema({ timestamps: true })
export class CandidateProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  UserId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  aboutme:string

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  profileUrl?: string;

  @Prop()
  coverUrl?: string;

  @Prop({ type: [ContactItemSchema], default: [] })
  contactInfo?: ContactItem[];

  @Prop({ type: [String], default: [] })
  education?: string[];

  @Prop({ type: [String], default: [] })
  skills?: string[];

  @Prop({ type: [String], default: [] })
  experience?: string[];

  @Prop()
  resumeUrl?: string;

  @Prop({ type: [String], default: [] }) 
  portfolioLinks?: string[]
}

export const CandidateProfileSchema = SchemaFactory.createForClass(CandidateProfile);
