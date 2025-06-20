import { RegisterCandidateDto } from "src/auth/dto/register-candidate.dto";
import { UserDocument } from "src/candidates/schema/candidate.schema";


export interface IAuthService {
    validateUser(email:string, password:string):Promise<UserDocument | null>
    registerCandidate(dto:RegisterCandidateDto):Promise<any>
    verifyEmail(token:string):Promise<any>
    // resendVerificationEmail(email:string):Promise<any>
    login(user:any):Promise<UserDocument>

}

export const AUTH_SERVICE = 'AUTH_SERVICE'