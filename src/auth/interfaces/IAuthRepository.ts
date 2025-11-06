import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { UserDocument } from '../schema/user.schema';
import { Types } from 'mongoose';
import { PopulatedCompany, populatedpData } from './api-response.interface';

export interface IAuthRepository extends IBaseRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;

  updateVerificationStatus(
    adminUserId: string,
    status: boolean,
  ): Promise<UserDocument | null>;

  UpdateGoogleId(id: string, googleid: string): Promise<UserDocument | null>;

  findUserbyEmailAndRole(
    email: string,
    role: string,
  ): Promise<UserDocument | null>;

  findCandidateByEmail(email: string): Promise<populatedpData>;

  findCompanyByEmail(email: string): Promise<PopulatedCompany>;

  findInternalUsers(companyId: Types.ObjectId): Promise<UserDocument[]>;

  findHrUsers(companyId: Types.ObjectId): Promise<UserDocument[]>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
