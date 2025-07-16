import { CreateCandidateProfileDto } from '../dtos/create-candidate-profile.dto';
import { CandidateProfileDocument } from '../schema/candidate.profile.schema';

export interface ICandidateService {
  findByEmail(email: string): Promise<CandidateProfileDocument | null>;
  findById(id: string): Promise<CandidateProfileDocument | null>;
  findAllCandidate(): Promise<CandidateProfileDocument[] | null>;
  createPorfile(dto: CreateCandidateProfileDto): Promise<CandidateProfileDocument>;
}

export const CANDIDATE_SERVICE = 'CANDIDATE_SERVICE';
