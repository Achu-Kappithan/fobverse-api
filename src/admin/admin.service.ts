import { Inject, Injectable, Logger } from '@nestjs/common';
import { IAdminService } from './interfaces/IAdminService';
import { COMAPNY_REPOSITORY, IcompanyRepository } from 'src/company/interface/profile.repository.interface';
import { CompanyRepository } from 'src/company/comapny.repository';
import { GetAllcompanyResponce } from './interfaces/responce.interface';
import { CompanyProfileDocument } from 'src/company/schema/company.profile.schema';
import { plainToInstance } from 'class-transformer';
import { CompanyResponseDto } from 'src/company/dtos/responce.allcompany';
import { CandidateProfileResponseDto } from 'src/candiate/dtos/candidate-responce.dto';
import { GetAllcandidatesResponce } from 'src/candiate/interfaces/responce.interface';
import { CANDIDATE_REPOSITORY, ICandidateRepository } from 'src/candiate/interfaces/candidate-repository.interface';

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

    async getAllCompnys():Promise<GetAllcompanyResponce<CompanyResponseDto>>{
        const data = await this._companyRepository.findAll()
        this.logger.debug(`[Adminservice] All company details fetch ${data}`)
        const mapdeData = plainToInstance(
            CompanyResponseDto,
            data.map(doc => {
                const obj = doc.toObject();
                return {
                ...obj,
                _id: obj._id.toString(),
                userId: obj.userId.toString(),
                };
            }),
            { excludeExtraneousValues: true }
            );
        return {
            message:"data fetched successfully",
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
                _id: obj._id.toString(),
                userId: obj.userId.toString()
            }
        }),
        { excludeExtraneousValues: true },
        );
        return {
            message: "datafetching successfully completed",
            data:mapdeData
        }
    }

}
