import { UserDocument } from "src/auth/schema/candidate.schema";
import { IBaseRepository } from "src/shared/interface/base-repository.interface";


export interface IAuthRepository extends IBaseRepository<UserDocument> {
    findByEmail(email:string):Promise<UserDocument |null >
    updateVerificationStatus(userId:string, status:boolean): Promise<UserDocument| null>
    UpdateGoogleId(id:string,googleid:string):Promise<UserDocument | null >
    findUserbyEmailAndRole(emai:string,role:string): Promise<UserDocument | null>
}


export const AUTH_REPOSITORY = 'AUTH_REPOSITORY'