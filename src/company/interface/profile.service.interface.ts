import { generalResponce } from "../../auth/interfaces/api-response.interface";
import { PaginationDto } from "../../shared/dtos/pagination.dto";
import { CreateProfileDto } from "../dtos/create.profile.dto";
import { CompanyProfileResponseDto, InternalUserResponceDto, TeamMemberResponceDto } from "../dtos/responce.allcompany";
import { changePassDto, InternalUserDto, TeamMemberDto, UpdateInternalUserDto, UpdateProfileDto } from "../dtos/update.profile.dtos";
import { CompanyProfileDocument } from "../schema/company.profile.schema";
import { comapnyResponceInterface } from "./responce.interface";


export interface IComapnyService {
    createProfile(dto:CreateProfileDto):Promise<CompanyProfileDocument>

    getPorfile(id:string):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>

    updatePorfile(id:string,dto:UpdateProfileDto):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>

    createUser(id:string,dto:InternalUserDto):Promise<comapnyResponceInterface<InternalUserResponceDto>>

    getInternalUsers(id:string,pagination:PaginationDto):Promise<comapnyResponceInterface<InternalUserResponceDto[]>>

    getUserProfile(id:string):Promise<comapnyResponceInterface<InternalUserResponceDto>>

    upateUserProfile(id:string,dto:UpdateInternalUserDto):Promise<comapnyResponceInterface<InternalUserResponceDto>>

    updatePassword(id:string,dto:changePassDto):Promise<generalResponce>

    addTeamMembers(id:string,dto:TeamMemberDto):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>



}

export const COMPANY_SERVICE = 'COMPANY_SERVICE'