import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
@Schema({ _id: false })
export class ContactItem {
  @Expose()
  @IsString()
  @Prop({ required: true })
  type: string;
  @Expose()
  @IsString()
  @Prop({ required: true })
  value: string;
}
export const ContactItemSchema = SchemaFactory.createForClass(ContactItem);
@Schema({ _id: false })
export class TeamMember {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  role: string;
  @Prop()
  image?: string;
}
export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
export type CompanyProfileDocument = HydratedDocument<CompanyProfile>;
@Schema({ timestamps: true })
export class CompanyProfile {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  adminUserId: Types.ObjectId;
  @Prop({ required: true, unique: true, index: true })
  name: string;
  @Prop()
  industry?: string;
  @Prop({ type: [String], default: [] })
  officeLocation?: string[];
  @Prop({ type: [String], default: [] })
  techStack?: string[];
  @Prop({ type: [String], default: [] })
  imageGallery?: string[];
  @Prop({ type: [TeamMemberSchema], default: [] })
  teamMembers?: TeamMember[];
  @Prop({ type: [String], default: [] })
  benefits?: string[];
  @Prop({ default: true })
  isActive: boolean;
  @Prop()
  logoUrl?: string;
  @Prop()
  description?: string;
  @Prop({ type: [ContactItemSchema], default: [] })
  contactInfo?: ContactItem[];
  _id?: string;
}
export const CompanyProfileSchema =
  SchemaFactory.createForClass(CompanyProfile);
