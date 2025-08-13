import { CompanyProfileDocument } from "../schema/company.profile.schema";
import { UpdateResult } from "mongoose";
import { InternalUserDto, TeamMemberDto } from "../dtos/update.profile.dtos";
import { IBaseRepository } from "../../shared/interface/base-repository.interface";


export interface IcompanyRepository extends IBaseRepository<CompanyProfileDocument> {

    updateStatus(id:string):Promise<UpdateResult>

    addInternalUser(id:string,dto:InternalUserDto):Promise<CompanyProfileDocument | null>

    addTeamMembers(id:string,dto:TeamMemberDto):Promise<CompanyProfileDocument | null>

}


export const COMAPNY_REPOSITORY = 'COMAPNY_REPOSITORY'