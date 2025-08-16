import { forwardRef, Inject, Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import { IComapnyService } from './interface/profile.service.interface';
import { COMAPNY_REPOSITORY, IcompanyRepository } from './interface/profile.repository.interface';
import { CreateProfileDto } from './dtos/create.profile.dto';
import { CompanyProfileResponseDto, UserResponceDto, TeamMemberResponceDto } from './dtos/responce.allcompany';
import { comapnyResponceInterface } from './interface/responce.interface';
import { plainToInstance } from 'class-transformer';
import { changePassDto, InternalUserDto, TeamMemberDto, UpdateInternalUserDto, UpdateProfileDto } from './dtos/update.profile.dtos';
import { CompanyProfileDocument } from './schema/company.profile.schema';
import { Types } from 'mongoose';
import { AUTH_SERVICE, IAuthService } from '../auth/interfaces/IAuthCandiateService';
import { MESSAGES } from '../shared/constants/constants.messages';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { generalResponce } from '../auth/interfaces/api-response.interface';

@Injectable()
export class CompanyService implements IComapnyService{
    logger = new Logger(CompanyService.name) 
    constructor(
        @Inject(COMAPNY_REPOSITORY)
        private readonly _companyRepository : IcompanyRepository,
        @Inject( forwardRef(()=>AUTH_SERVICE))
        private readonly _AuthService: IAuthService
    ){}

    //for updating bolock /unblock Status
    async createProfile(dto: CreateProfileDto): Promise<CompanyProfileDocument> {
       this.logger.debug(`[CompanyService] creating new company profiel${dto.name}`)
       const updateDto = {
             name:dto.name,
             adminUserId : new Types.ObjectId(dto.UserId)
           }
        const newProfile = await this._companyRepository.create(updateDto)
        this.logger.debug(`[CompanyService] new profile created ${newProfile}`)
        if(!newProfile){
            throw new InternalServerErrorException(MESSAGES.AUTH.PROFILE_CREATION_FAIILD)
        }
        return newProfile
    }

    // for fetching company profile

    async getPorfile(id: string): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
        const profiledata = await  this._companyRepository.findById(id)
        const mappedData = plainToInstance(
            CompanyProfileResponseDto,
            {
                ...profiledata?.toObject(),
            }
            ,{excludeExtraneousValues:true}
        )
        return {
            message:MESSAGES.COMPANY.PROFILE_FETCH_SUCCESS,
            data: mappedData! 
        }
    }

    // updating profile  wiht new data

    async updatePorfile(id:string,dto:UpdateProfileDto):Promise<comapnyResponceInterface<CompanyProfileResponseDto>>{
        const updatedata = await this._companyRepository.update({_id:id},{$set:dto})

        const mappedData = plainToInstance(
        CompanyProfileResponseDto,
        {
            ...updatedata?.toJSON(),
        },
        {excludeExtraneousValues : true}
        )
        return {
            message:MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
            data:mappedData
        }
    }

    //add internal users to the company

    async createUser(id:string, dto: InternalUserDto): Promise<comapnyResponceInterface<UserResponceDto>> {
        const data = await this._AuthService.createInternalUser(id,dto)
        return  {
            message:MESSAGES.COMPANY.USER_REG_SUCCESS,
            data:data
        }
    }

    // get all Internal users

    async getInternalUsers(id:string,pagination:PaginationDto):Promise<comapnyResponceInterface<UserResponceDto[]>>{
        this.logger.log(`[ComapanyService] id get in Comapny service :${id}`)
        return await this._AuthService.getAllUsers(id,pagination)
    }

    //getUserProfile

    async getUserProfile(id:string):Promise<comapnyResponceInterface<UserResponceDto>>{
        this.logger.log(`[ComapayService] try to getUser Profile ${id}`)
        const userProfile = await this._AuthService.getUserProfile(id)
        return {
            message:MESSAGES.COMPANY.USER_PROFILE_GET,
            data:userProfile
        }
    }

    //updateUserProfile

    async upateUserProfile(id: string, dto: UpdateInternalUserDto): Promise<comapnyResponceInterface<UserResponceDto>> {
        const data =await this._AuthService.updateUserProfile(id,dto)
        return{
            message:MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
            data:data
        }
    }

    // update Password

    async updatePassword(id:string,dto:changePassDto):Promise<generalResponce>{
        return await this._AuthService.changePassword(id,dto)
    }

    //addTeamMembers

    async addTeamMembers(id:string, dto: TeamMemberDto): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
        const data =  await this._companyRepository.addTeamMembers(id,dto)

        const mappedData = plainToInstance(
        CompanyProfileResponseDto,
        {
            ...data?.toJSON(),
        },
        {excludeExtraneousValues : true}
        )
        return {
            message:MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
            data:mappedData
        }
    }

}
