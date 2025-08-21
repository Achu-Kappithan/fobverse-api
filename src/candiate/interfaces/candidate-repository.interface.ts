import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { CandidateProfileDocument } from '../schema/candidate.profile.schema';
import { UpdateResult } from 'mongoose';

export interface ICandidateRepository
  extends IBaseRepository<CandidateProfileDocument> {
  findByEmail(email: string): Promise<CandidateProfileDocument | null>;
  updateStatus(id: string): Promise<UpdateResult>;
}

export const CANDIDATE_REPOSITORY = 'CANDIDATE_REPOSITORY';
