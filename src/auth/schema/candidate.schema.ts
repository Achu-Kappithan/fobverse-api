import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  CANDIDATE = 'candidate',
  COMPANY = 'company',
  ADMIN = 'admin',
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

  @Prop({ default: false })
  isGlobalAdmin: boolean;

  @Prop({ required: false })
  googleId?: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  role: UserRole;

  _id?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
