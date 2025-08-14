import { Inject, Injectable, Logger } from '@nestjs/common';
import { IJobService } from './interfaces/jobs.service.interface';
import { ResponseJobsDto } from './dtos/responce.job.dto';
import { IJobsRepository, JOBS_REPOSITORY } from './interfaces/jobs.repository.interface';
import { plainToInstance } from 'class-transformer';
import { FilterQuery, Types } from 'mongoose';
import { Jobs } from './schema/jobs.schema';
import { ApiResponce } from '../shared/interface/api.responce';
import { MESSAGES } from '../shared/constants/constants.messages';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { PaginatedResponse } from '../admin/interfaces/responce.interface';
import { JobsDto } from './dtos/createjobs.dto';

@Injectable()
export class JobsService implements IJobService {
    constructor(
        @Inject(JOBS_REPOSITORY)
        private readonly _jobRepository:IJobsRepository
    ) {}
    logger = new Logger(JobsService.name)

    // creating Jobs

    async createJobs(id: string, dto: JobsDto): Promise<ApiResponce<ResponseJobsDto>> {
        this.logger.log(`[JobService] data get for registration id: ${id} data: ${dto}`)
        const objId = new Types.ObjectId(id)
        const data = {...dto,companyId:objId}
        const jobData = await this._jobRepository.create(data)

        this.logger.log(`[JobService] new job created ${jobData}`)

        const mappedData = plainToInstance(
            ResponseJobsDto,
            {
                ...jobData.toJSON(),
                _id: jobData._id.toString(),
                companyId: jobData.companyId.toString()
            }
        )
        return {
            message:MESSAGES.COMPANY.NEW_JOB_ADDED,
            data:mappedData
        }
    }

    //for geting Alljobs

    async getAllJobs(id:string,pagination:PaginationDto):Promise<PaginatedResponse<ResponseJobsDto[]>>{
        const {search, page=1, limit=6} = pagination
        const filter:FilterQuery<Jobs> = {}

        if(search){
            filter.title = {$regex:`^${search}`,$options:'i'}
        }
        const companyId = new Types.ObjectId(id)
        filter.companyId = companyId

        this.logger.log(`[JobServie] comapny id for get All jobs :${id} and query ${filter} `)
        const skip = (page-1)*limit

        const {data, total} = await this._jobRepository.findManyWithPagination(filter,{skip,limit})
        const plaindata  =data.map(val =>({
            ...val.toJSON(),
            _id:val._id.toString(),
            companyId: val.companyId.toString()
        }))
        const mappedData = plainToInstance(
            ResponseJobsDto,
            plaindata
        )

        const totalPages = Math.ceil(total/limit)

        return{
            data:mappedData,
            message:MESSAGES.COMPANY.FETCH_ALL_JOBS,
            currentPage:page,
            totalItems:total,
            totalPages:totalPages,
            itemsPerPage:limit
        }
    }

    //show job Details

    async getJobDetails(id:string):Promise<ApiResponce<ResponseJobsDto>>{
        const data  = await this._jobRepository.findById(id)
        this.logger.log(`[jobService] find jobDetails id: ${id} data: ${data}`)
        const mappedData = plainToInstance(
            ResponseJobsDto,
            {
                ...data?.toJSON(),
                _id: data?._id.toString(),
                companyId: data?.companyId.toString()
            },
            {excludeExtraneousValues:true}
        )
        return {
            message:MESSAGES.COMPANY.GET_JOBDETAIS,
            data:mappedData
        }
    }


    async updateJobDetails(id:string,dto:JobsDto):Promise<ApiResponce<ResponseJobsDto>>{
        const data = await this._jobRepository.update({_id:id},{$set:dto})

        const mappedData = plainToInstance(
             ResponseJobsDto,
            {
                ...data?.toJSON(),
                _id: data?._id.toString(),
                companyId: data?.companyId.toString()
            },
            {excludeExtraneousValues:true}
        )

        return {
            message:MESSAGES.COMPANY.UPDATE_JOBS,
            data:mappedData
        }
    }
    
}
