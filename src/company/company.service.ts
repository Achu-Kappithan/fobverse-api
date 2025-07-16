import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger, Req, Request } from '@nestjs/common';
import { IComapnyService } from './interface/profile.service.interface';
import { COMAPNY_REPOSITORY, IcompanyRepository } from './interface/profile.repository.interface';
import { CompanyRepository } from './comapny.repository';
import { CoamapnyUserDto, CreateProfileDto } from './dtos/create.profile.dto';
import { CompanyProfileResponseDto, InteranalUserResponceDto } from './dtos/responce.allcompany';
import { comapnyResponceInterface } from './interface/responce.interface';
import { plainToInstance } from 'class-transformer';
import { InternalUserDto, UpdateProfileDto } from './dtos/update.profile.dtos';
import { MESSAGES } from 'src/shared/constants/constants.messages';
import { CompanyProfileDocument } from './schema/company.profile.schema';
import { Types } from 'mongoose';
import { AUTH_REPOSITORY, IAuthRepository } from 'src/auth/interfaces/IAuthRepository';
import { AuthService } from 'src/auth/auth.service';
import  * as bcrypt from 'bcrypt'
import { UserDocument } from 'src/auth/schema/user.schema';
import { RegisterCandidateDto } from 'src/auth/dto/register-candidate.dto';

@Injectable()
export class CompanyService implements IComapnyService{
    logger = new Logger(CompanyService.name) 
    constructor(
        @Inject(COMAPNY_REPOSITORY)
        private readonly _companyRepository : IcompanyRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly _AuthRepository: IAuthRepository
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

    async createUser(id:string, dto: InternalUserDto): Promise<comapnyResponceInterface<InteranalUserResponceDto>> {
       const existinguser = await this._AuthRepository.findByEmail(dto.email)

       if(existinguser){
        this.logger.log(`[AuthService] Email alredy Exist${dto.email}`)
        throw new ConflictException(MESSAGES.COMPANY.ALREADY_EXIST)
       }

       const hashedPassword = await bcrypt.hash(dto.password,10)

       console.log("before creatin ",id)

       const newUser = {
        name: dto.name,
        email: dto.email,
        role: dto.role,
        password: hashedPassword,
        isVerified: true,
        companyId: new Types.ObjectId(id)
       }

       console.log("after createion",newUser.companyId)

       const data = await this._AuthRepository.create(newUser)
       this.logger.log(`[comapnyService] new company member is added${data.toJSON()}`)

        const mappedData = plainToInstance(
        InteranalUserResponceDto,
        {
            ...data?.toJSON()
        },
        {excludeExtraneousValues:true}
       )
       console.log('udpdated responce in service file',mappedData)
       return {
        message: MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
        data : mappedData
       }
    }


}
