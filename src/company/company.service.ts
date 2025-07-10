import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { IComapnyService } from './interface/profile.service.interface';
import { COMAPNY_REPOSITORY } from './interface/profile.repository.interface';
import { CompanyRepository } from './comapny.repository';
import { CreateProfileDto } from './dtos/create.profile.dto';
import { CompanyProfileResponseDto } from './dtos/responce.allcompany';
import { comapnyResponceInterface } from './interface/responce.interface';
import { plainToInstance } from 'class-transformer';
import { compareSync } from 'bcrypt';

@Injectable()
export class CompanyService implements IComapnyService{
    logger = new Logger(CompanyService.name)
    constructor(
        @Inject(COMAPNY_REPOSITORY)
        private readonly _companyRepository : CompanyRepository
    ){}

    //for updating bolock /unblock Status
    async createProfile(dto: CreateProfileDto): Promise<void> {
       this.logger.debug(`[CompanyService] creating new company profiel${dto.name}`)
        const newProfile = await this._companyRepository.create(dto)
        this.logger.debug(`[CompanyService] new profile created ${newProfile}`)
        if(!newProfile){
            throw new InternalServerErrorException('error regding profile creation')
        }
    }

    // for fetching company profile

    async getPorfile(id: string): Promise<comapnyResponceInterface<CompanyProfileResponseDto>> {
        const profiledata = await  this._companyRepository.findOne({userId:id})
        const mappedData = plainToInstance(
            CompanyProfileResponseDto,
            {
                ...profiledata?.toObject(),
                _id: profiledata?._id.toString(),
                userId: profiledata?.userId.toString()
            }
            ,{excludeExtraneousValues:true}
        )
        console.log("profiledata of user",mappedData)
        return {
            message: 'success',
            data: mappedData! 
        }
    }



}
