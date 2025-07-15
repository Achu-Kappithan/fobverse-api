import { BaseRepository } from "src/shared/repositories/base.repository";
import { CompanyProfileDocument } from "../schema/company.profile.schema";
import { UpdateResult } from "mongoose";
import { InternalUserDto } from "../dtos/update.profile.dtos";


export interface IcompanyRepository extends BaseRepository<CompanyProfileDocument> {

    updateStatus(id:string):Promise<UpdateResult>

    addInternalUser(id:string,dto:InternalUserDto):Promise<CompanyProfileDocument | null>

}


export const COMAPNY_REPOSITORY = 'COMAPNY_REPOSITORY'