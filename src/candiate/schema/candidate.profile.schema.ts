

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false }) // Use _id: false if you don't want MongoDB to generate _id for sub-documents
export class ContactItem {
  @Prop({ required: true })
  type: string; // e.g., 'phoneNumber', 'email', 'linkedIn', 'address', 'github', 'website'
  @Prop({ required: true })
  value: string; // The actual phone number, email address, URL, or address string
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
