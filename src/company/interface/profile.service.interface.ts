import { CoamapnyUserDto, CreateProfileDto } from "../dtos/create.profile.dto";
import { CompanyProfileResponseDto, InteranalUserResponceDto } from "../dtos/responce.allcompany";
import { InternalUserDto, UpdateProfileDto } from "../dtos/update.profile.dtos";
import { CompanyProfileDocument } from "../schema/company.profile.schema";
import { comapnyResponceInterface } from "./responce.interface";


export interface IComapnyService {
    createProfile(dto:CreateProfileDto):Promise<CompanyProfileDocument>

    getPorfile(id:string):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>

    updatePorfile(id:string,dto:UpdateProfileDto):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>

    createUser(id:string,dto:InternalUserDto):Promise<comapnyResponceInterface<InteranalUserResponceDto>>

}

export const COMPANY_SERVICE = 'COMPANY_SERVICE'