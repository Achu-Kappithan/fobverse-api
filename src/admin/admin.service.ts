import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAdminService } from './interfaces/IAdminService';
import { COMAPNY_REPOSITORY, IcompanyRepository } from 'src/company/interface/profile.repository.interface';
import { GetAllcompanyResponce, PaginatedResponse, PlainResponse } from './interfaces/responce.interface';
import { plainToInstance } from 'class-transformer';
import { CompanyProfileResponseDto } from 'src/company/dtos/responce.allcompany';
import { CandidateProfileResponseDto } from 'src/candiate/dtos/candidate-responce.dto';
import { GetAllcandidatesResponce } from 'src/candiate/interfaces/responce.interface';
import { CANDIDATE_REPOSITORY, ICandidateRepository } from 'src/candiate/interfaces/candidate-repository.interface';
import { MESSAGES } from 'src/shared/constants/constants.messages';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { FilterQuery } from 'mongoose';
import { CompanyProfile } from 'src/company/schema/company.profile.schema';
import { CandidateProfile } from 'src/candiate/schema/candidate.profile.schema';

@Injectable()
export class AdminService implements IAdminService {
    logger = new  Logger(AdminService.name)
    constructor (
        @Inject(COMAPNY_REPOSITORY)
        private readonly _companyRepository:IcompanyRepository,
        @Inject(CANDIDATE_REPOSITORY)
        private readonly _candidateRepository:ICandidateRepository
    ) {}


    async getAllCompnys(dto: PaginationDto): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
        const { page= 1, limit= 6, search } = dto
        const filter:FilterQuery<CompanyProfile> = {}
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page-1)* limit
        this.logger.debug(`[AdminService] Fetching companies with: Page ${page}, Limit ${limit}, Search "${search || 'N/A'}"`);

        const { data, total } = await this._companyRepository.findManyWithPagination(filter, {
            limit,
            skip,
        });

        this.logger.debug(`[AdminService] Found ${data.length} companies on page, Total ${total}`);
        const mappedData = plainToInstance(
        CompanyProfileResponseDto,
            data.map(doc => {
                const obj = doc.toObject({ getters: true, virtuals: false });
                return {
                ...obj,
                _id: obj._id.toString(),
                adminUserId: obj.adminUserId ? obj.adminUserId.toString() : undefined,
                };
            }),
            { excludeExtraneousValues: true }
        );

        const totalPages = Math.ceil(total / limit);
        return {
            message: MESSAGES.ADMIN.DATA_RETRIEVED,
            data:mappedData,
            currentPage:page,
            totalItems:total,
            totalPages:totalPages,
            itemsPerPage:limit
        }
    }

    // for  fetching all Candidates
   async getAllCandidates(dto:PaginationDto): Promise<PaginatedResponse<CandidateProfileResponseDto[]>>{
    const{ page=1 ,limit=6 , search}= dto

    const filter:FilterQuery<CandidateProfile> = {}

    if(search){
        filter.name = {$regex:search,$options:'i'}
    }
    
    const skip = (page -1)* limit
    this.logger.debug(`[AdminService] Fetching companies with: Page ${page}, Limit ${limit}, Search "${search || 'N/A'}"`);

    const {data, total}  = await this._candidateRepository.findManyWithPagination(filter,{limit, skip})

    this.logger.debug(`[adminService] fetch all candidate data ${data}`)
    const mapdeData = plainToInstance(
        CandidateProfileResponseDto,
        data.map(doc=>{
            const obj = doc.toObject({getters:true, virtuals: true})
            return {
                ...obj,
                id: obj._id.toString(),
                adminUserId: obj.adminUserId.toString()
            }
        }),
        { excludeExtraneousValues: true },
        );
        const totalpages = Math.ceil(total/limit)
        this.logger.log(`[AdminService] mapped data of company for fetching ${mapdeData}`)
        return {
            message:MESSAGES.ADMIN.DATA_RETRIEVED,
            data:mapdeData,
            currentPage : page,
            totalItems : total,
            totalPages: totalpages,
            itemsPerPage: limit
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
