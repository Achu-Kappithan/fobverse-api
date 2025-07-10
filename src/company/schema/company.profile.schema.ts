import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type CompanyProfileDocument = HydratedDocument<CompanyProfile>

@Schema({ timestamps: true })
export class CompanyProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  industry?: string;

  @Prop({ type: [String], default: [] })
  contactInfo?: string[];

  @Prop({ type: [String], default: [] })
  officeLocation?: string[];

  @Prop({ type: [String], default: [] })
  techStack?: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  location?: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  description?: string;
}

export const CompanyProfileSchema = SchemaFactory.createForClass(CompanyProfile);
