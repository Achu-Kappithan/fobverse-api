import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, Logger, Req, Request } from '@nestjs/common';
import { IComapnyService } from './interface/profile.service.interface';
import { COMAPNY_REPOSITORY, IcompanyRepository } from './interface/profile.repository.interface';
import { CompanyRepository } from './comapny.repository';
import { CoamapnyUserDto, CreateProfileDto } from './dtos/create.profile.dto';
import { CompanyProfileResponseDto, InternalUserResponceDto } from './dtos/responce.allcompany';
import { comapnyResponceInterface } from './interface/responce.interface';
import { plainToInstance } from 'class-transformer';
import { InternalUserDto, UpdateProfileDto } from './dtos/update.profile.dtos';
import { MESSAGES } from 'src/shared/constants/constants.messages';
import { CompanyProfileDocument } from './schema/company.profile.schema';
import { Types } from 'mongoose';
import { AUTH_SERVICE, IAuthService } from 'src/auth/interfaces/IAuthCandiateService';

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
             adminUserId : new Types.ObjectId(dto.adminUserId)
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

    async createUser(id:string, dto: InternalUserDto): Promise<comapnyResponceInterface<InternalUserResponceDto>> {
        const data = await this._AuthService.createInternalUser(id,dto)
        return  {
            message:MESSAGES.COMPANY.USER_REG_SUCCESS,
            data:data
        }
    }


    async getInternalUsers(id:string):Promise<comapnyResponceInterface<InternalUserResponceDto[]>>{
        this.logger.log(`[ComapanyService] id get in Comapny service :${id}`)
        const internalUsers = await this._AuthService.getUsers(id)
        this.logger.log(`[comapnyService] getall internal users ${internalUsers}`)
        return {
            message: MESSAGES.COMPANY.USERS_GET_SUCCESS,
            data:internalUsers
        }
    }


}
