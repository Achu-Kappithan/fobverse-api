import { UserDocument } from 'src/auth/schema/candidate.schema';

export interface ICandidateService {
  findByEmail(email: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  createCandidate(
    name: string,
    email: string,
    password: string,
  ): Promise<UserDocument | null>;
  updateVerificationStatus(
    userId: string,
    status: boolean,
  ): Promise<UserDocument | null>;
  createGoogleUser(
    name: string,
    googleId: string,
    email: string,
    isVerified: boolean,
  ): Promise<UserDocument | null>;
  linkGoogleAccount(id: string, googleId: string): Promise<UserDocument | null>;
}

export const CANDIDATE_SERVICE = 'CANDIDATE_SERVICE';
