import { Inject, Injectable, InternalServerErrorException, Logger, Req, Request } from '@nestjs/common';
import { IComapnyService } from './interface/profile.service.interface';
import { COMAPNY_REPOSITORY } from './interface/profile.repository.interface';
import { CompanyRepository } from './comapny.repository';
import { CreateProfileDto } from './dtos/create.profile.dto';
import { CompanyProfileResponseDto } from './dtos/responce.allcompany';
import { comapnyResponceInterface } from './interface/responce.interface';
import { plainToInstance } from 'class-transformer';
import { InternalUserDto, UpdateProfileDto } from './dtos/update.profile.dtos';
import { MESSAGES } from 'src/shared/constants/constants.messages';
import { CompanyProfileDocument } from './schema/company.profile.schema';
import { Types } from 'mongoose';

@Injectable()
export class CompanyService implements IComapnyService{
    logger = new Logger(CompanyService.name)
    constructor(
        @Inject(COMAPNY_REPOSITORY)
        private readonly _companyRepository : CompanyRepository,
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
        const profiledata = await  this._companyRepository.findOne({userId:id})
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
        const updatedata = await this._companyRepository.update({userId:id},{$set:dto})

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

    async createUser(id: string, dto: InternalUserDto): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
       const data = await this._companyRepository.addInternalUser(id,dto)
       const mappedData = plainToInstance(
        CompanyProfileResponseDto,
        {
            ...data?.toJSON()

        },
        {excludeExtraneousValues:true}
       )
       console.log('udpdated responce in service file',data)
       return {
        message: MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
        data : mappedData
       }
    }


}
