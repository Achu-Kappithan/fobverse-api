import { IBaseRepository } from 'src/shared/interface/base-repository.interface';
import { UserDocument } from '../schema/user.schema';

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

  findCandidateByEmail(email:string):Promise<any>

  findCompanyByEmail(email:string):Promise<any>
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
