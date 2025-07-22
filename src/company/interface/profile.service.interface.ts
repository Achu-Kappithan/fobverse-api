import { generalResponce } from "src/auth/interfaces/api-response.interface";
import { CreateProfileDto } from "../dtos/create.profile.dto";
import { CompanyProfileResponseDto, InternalUserResponceDto } from "../dtos/responce.allcompany";
import { changePassDto, InternalUserDto, UpdateInternalUserDto, UpdateProfileDto } from "../dtos/update.profile.dtos";
import { CompanyProfileDocument } from "../schema/company.profile.schema";
import { comapnyResponceInterface } from "./responce.interface";
import { PaginationDto } from "src/shared/dtos/pagination.dto";


export interface IComapnyService {
    createProfile(dto:CreateProfileDto):Promise<CompanyProfileDocument>

    getPorfile(id:string):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>

    updatePorfile(id:string,dto:UpdateProfileDto):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>

    createUser(id:string,dto:InternalUserDto):Promise<comapnyResponceInterface<InternalUserResponceDto>>

    getInternalUsers(id:string,pagination:PaginationDto):Promise<comapnyResponceInterface<InternalUserResponceDto[]>>

    getUserProfile(id:string):Promise<comapnyResponceInterface<InternalUserResponceDto>>

    upateUserProfile(id:string,dto:UpdateInternalUserDto):Promise<comapnyResponceInterface<InternalUserResponceDto>>

    UpdatePassword(id:string,dto:changePassDto):Promise<generalResponce>



}

export const COMPANY_SERVICE = 'COMPANY_SERVICE'