import { CreateProfileDto } from "../dtos/create.profile.dto";
import { CompanyProfileResponseDto } from "../dtos/responce.allcompany";
import { comapnyResponceInterface } from "./responce.interface";


export interface IComapnyService {
    createProfile(dto:CreateProfileDto):Promise<void>

    getPorfile(id:string):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>

}

export const COMPANY_SERVICE = 'COMPANY_SERVICE'