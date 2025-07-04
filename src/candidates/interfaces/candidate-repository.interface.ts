import { UserDocument } from 'src/auth/schema/candidate.schema';
import { IBaseRepository } from 'src/shared/interface/base-repository.interface';

export interface ICandidateRepository extends IBaseRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  updateVerificationStatus(
    userId: string,
    status: boolean,
  ): Promise<UserDocument | null>;
  UpdateGoogleId(id: string, googleid: string): Promise<UserDocument | null>;
}

export const CANDIDATE_REPOSITORY = 'CANDIDATE_REPOSITORY';
