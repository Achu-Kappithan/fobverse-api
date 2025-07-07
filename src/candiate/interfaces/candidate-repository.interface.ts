import { UserDocument } from 'src/auth/schema/candidate.schema';
import { IBaseRepository } from 'src/shared/interface/base-repository.interface';
import { CandidateRepository } from '../candidate.repository';
import { CandidateProfileDocument } from '../schema/candidate.profile.schema';

export interface ICandidateRepository
  extends IBaseRepository<CandidateProfileDocument> {
  findByEmail(email: string): Promise<CandidateProfileDocument | null>;
}

export const CANDIDATE_REPOSITORY = 'CANDIDATE_REPOSITORY';
