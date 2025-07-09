import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/shared/repositories/base.repository";
import { CompanyProfileDocument } from "../schema/company.profile.schema";
import { UpdateResult } from "mongoose";


export interface IcompanyRepository extends BaseRepository<CompanyProfileDocument> {

    updateStatus(id:string):Promise<UpdateResult>

}


export const COMAPNY_REPOSITORY = 'COMAPNY_REPOSITORY'