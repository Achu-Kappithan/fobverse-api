import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum UserRole {
  CANDIDATE = 'candidate',
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  HR_USER = 'hr_user',
  INTERVIEWER_USER = 'interviewer_user',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: false })
  googleId?: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'CompanyProfile', index: true })
  companyId?: Types.ObjectId;

  @Prop({ type: String })
  profileImg?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
