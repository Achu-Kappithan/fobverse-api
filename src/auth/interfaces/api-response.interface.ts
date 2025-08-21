import { CandidateProfileDocument } from '../../candiate/schema/candidate.profile.schema';
import { CompanyProfileDocument } from '../../company/schema/company.profile.schema';
import { UserDocument } from '../schema/user.schema';

export interface LoginResponce<T> {
  data: T;
  message: string;
}

export interface RegisterResponce {
  user: UserDocument;
  message: string;
  verificationToken?: string;
}

export interface verificatonResponce {
  message: string;
  user: UserDocument;
}

export interface tokenresponce {
  newAccess?: string;
  message: string;
}

export interface generalResponce {
  message: string;
}

export type populatedpData = UserDocument & {
  profile: CandidateProfileDocument;
};

export type PopulatedCompany = UserDocument & {
  profile: CompanyProfileDocument;
};
