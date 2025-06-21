import { RegisterCandidateDto } from "src/auth/dto/register-candidate.dto";
import { UserDocument } from "src/candidates/schema/candidate.schema";
import { LoginResponce, RegisterResponce, tokenresponce, verificatonResponce } from "./api-response.interface";
import { JwtRefreshPayload } from "./jwt-payload.interface";


export interface IAuthService {
    validateUser(email:string, password:string):Promise<UserDocument | null>
    registerCandidate(dto:RegisterCandidateDto):Promise<RegisterResponce>
    verifyEmail(token:string):Promise<verificatonResponce>
    // resendVerificationEmail(email:string):Promise<any>
    login(user:any):Promise<LoginResponce>
    regenerateAccessToken(paylod:JwtRefreshPayload):Promise<tokenresponce>
}

export const AUTH_SERVICE = 'AUTH_SERVICE'