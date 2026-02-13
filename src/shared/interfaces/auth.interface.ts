import { Request } from 'express';
import { CandidateProfileDocument } from '../../candiate/schema/candidate.profile.schema';
import { CompanyProfileDocument } from '../../company/schema/company.profile.schema';
import { Types } from 'mongoose';
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
export interface populatedpData {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  password?: string;
  googleId?: string;
  isVerified: boolean;
  profile: CandidateProfileDocument;
  companyId?: Types.ObjectId;
}
export interface PopulatedCompany {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  password?: string;
  googleId?: string;
  isVerified: boolean;
  profile: CompanyProfileDocument;
  companyId?: Types.ObjectId;
}
