import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/shared/repositories/base.repository";
import { CompanyProfileDocument } from "../schema/company.profile.schema";


@Injectable()
export class IcompanyRepository extends BaseRepository<CompanyProfileDocument> {


}


export const COMAPNY_REPOSITORY = 'COMAPNY_REPOSITORY'