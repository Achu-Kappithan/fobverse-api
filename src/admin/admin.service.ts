import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAdminService } from './interfaces/IAdminService';
import { COMAPNY_REPOSITORY, IcompanyRepository } from 'src/company/interface/profile.repository.interface';
import { GetAllcompanyResponce, PlainResponse } from './interfaces/responce.interface';
import { plainToInstance } from 'class-transformer';
import { CompanyProfileResponseDto } from 'src/company/dtos/responce.allcompany';
import { CandidateProfileResponseDto } from 'src/candiate/dtos/candidate-responce.dto';
import { GetAllcandidatesResponce } from 'src/candiate/interfaces/responce.interface';
import { CANDIDATE_REPOSITORY, ICandidateRepository } from 'src/candiate/interfaces/candidate-repository.interface';
import { MESSAGES } from 'src/shared/constants/constants.messages';

@Injectable()
export class AdminService implements IAdminService {
    logger = new  Logger(AdminService.name)
    constructor (
        @Inject(COMAPNY_REPOSITORY)
        private readonly _companyRepository:IcompanyRepository,
        @Inject(CANDIDATE_REPOSITORY)
        private readonly _candidateRepository:ICandidateRepository
    ) {}

    //for featching all companyes

    async getAllCompnys():Promise<GetAllcompanyResponce<CompanyProfileResponseDto>>{
        const data = await this._companyRepository.findAll()
        this.logger.debug(`[Adminservice] All company details fetch ${data}`)
        const mapdeData = plainToInstance(
            CompanyProfileResponseDto,
            data.map(doc => {
                const obj = doc.toObject();
                return {
                ...obj,
                _id: obj._id.toString(),
                adminUserId: obj.adminUserId.toString(),
                };
            }),
            { excludeExtraneousValues: true }
            );
        return {
            message:MESSAGES.ADMIN.DATA_RETRIEVED,
            data: mapdeData
        }
    }

    // for  fetching all Candidates
   async getAllCandidates(): Promise<GetAllcandidatesResponce<CandidateProfileResponseDto>>{
    const data  = await this._candidateRepository.findAll()
    this.logger.debug(`[adminService] fetch all candidate data ${data}`)
    const mapdeData = plainToInstance(
        CandidateProfileResponseDto,
        data.map(doc=>{
            const obj = doc.toObject()
            return {
                ...obj,
                id: obj._id.toString(),
                adminUserId: obj.adminUserId.toString()
            }
        }),
        { excludeExtraneousValues: true },
        );
        this.logger.log(`[AdminService] mapped data of company for fetching ${mapdeData}`)
        return {
            message:MESSAGES.ADMIN.DATA_RETRIEVED,
            data:mapdeData
        }
    }

    async updateCompanyStatus(id:string): Promise<PlainResponse> {
       const data = await this._companyRepository.updateStatus(id)
       this.logger.debug(`[AdminService] status Updated data ${data}`)
       return {
        message:MESSAGES.ADMIN.STATUS_UPDATED
       }
    }

    async updateCandidateStatus(id:string): Promise<PlainResponse> {
       const data = await this._candidateRepository.updateStatus(id)
       this.logger.debug(`[AdminService] status Updated data ${data}`)
       return {
        message: MESSAGES.ADMIN.STATUS_UPDATED
       }
    }

}
