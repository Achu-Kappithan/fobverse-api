import { Request } from 'express';
import { Types } from 'mongoose';

export interface ApiResponce<T> {
  message: string;
  data?: T;
}

export interface AuthUser {
  _id: Types.ObjectId;
  UserId: string;
  email: string;
  role: string;
  profileId?: string;
  companyId?: string;
}

export interface ERequest extends Request {
  user?: AuthUser;
}
