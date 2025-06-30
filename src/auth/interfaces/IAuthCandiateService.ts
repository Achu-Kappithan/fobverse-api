import { RegisterCandidateDto } from "src/auth/dto/register-candidate.dto";
import { LoginResponce, RegisterResponce, tokenresponce, verificatonResponce } from "./api-response.interface";
import { JwtRefreshPayload } from "./jwt-payload.interface";
import { UserDocument } from "../schema/candidate.schema";
import { LoginDto } from "../dto/login.dto";


export interface IAuthService {
    validateUser(email:string, password:string, role:string):Promise<UserDocument | null>
    registerCandidate(dto:RegisterCandidateDto):Promise<RegisterResponce>
    verifyEmail(token:string):Promise<verificatonResponce>
    // resendVerificationEmail(email:string):Promise<any>
    login(user:any):Promise<LoginResponce>
    regenerateAccessToken(paylod:JwtRefreshPayload):Promise<tokenresponce>
    googleLogin(idToken:string,role:string):Promise<LoginResponce>
    findByEmail(email: string): Promise<UserDocument | null>
    linkGoogleAccount(id: string, googleId: string): Promise<UserDocument | null>
    findById(id: string): Promise<UserDocument | null>
    validateAdmin(dto:LoginDto): Promise<UserDocument | null>
}

export const AUTH_SERVICE = 'AUTH_SERVICE'