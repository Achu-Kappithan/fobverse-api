import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({_id:false})
export class TeamMember {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop()
  image?: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember)


@Schema({_id:false})
export class InternalUser {
   @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  profilePic?: string;
}

export const InternalUserSchema = SchemaFactory.createForClass(InternalUser);

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
  officeLocation?: string[];

  @Prop({ type: [String], default: [] })
  techStack?: string[];

  @Prop({ type: [String], default:[]})
  imageGallery?:string[]

  @Prop({ type: [TeamMemberSchema], default: [] })
  teamMembers?: TeamMember[];

  @Prop({ type: [InternalUserSchema], default: [] })
  internalUsers?: InternalUser[];

  @Prop({type:[String], default:[]})
  benafits?:string[]

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  logoUrl?: string;

  @Prop()
  description?: string;

  @Prop({
  type: [
      {
        type: { type: String },
        value: { type: String },
      },
    ],
    default: [],
  })
  contactInfo?: { type: string; value: string }[];

  _id?:string
}

export const CompanyProfileSchema = SchemaFactory.createForClass(CompanyProfile);



