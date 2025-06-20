import { IBaseRepository } from "src/shared/interface/base-repository.interface";
import { UserDocument } from "../schema/candidate.schema";


export interface ICandidateRepository extends IBaseRepository<UserDocument> {
    findByEmail(email:string):Promise<UserDocument |null >
    updateVerificationStatus(userId:string, status:boolean): Promise<UserDocument| null>
}


export const CANDIDATE_REPOSITORY = 'CANDIDATE_REPOSITORY'