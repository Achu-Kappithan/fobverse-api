import { Inject, Injectable, Logger } from '@nestjs/common';
import { IJobService } from './interfaces/jobs.service.interface';
import { ApiResponce } from 'src/shared/interface/api.responce';
import { createJobsDto } from './dtos/createjobs.dto';
import { ResponseJobsDto } from './dtos/responce.job.dto';
import { IJobsRepository, JOBS_REPOSITORY } from './interfaces/jobs.repository.interface';
import { plainToInstance } from 'class-transformer';
import { MESSAGES } from 'src/shared/constants/constants.messages';
import { Types } from 'mongoose';

@Injectable()
export class JobsService implements IJobService {
    constructor(
        @Inject(JOBS_REPOSITORY)
        private readonly _jobRepository:IJobsRepository
    ) {}
    logger = new Logger(JobsService.name)

    async CreateJobs(id: string, dto: createJobsDto): Promise<ApiResponce<ResponseJobsDto>> {
        this.logger.log(`[JobService] data get for registration id: ${id} data: ${dto}`)
        const objId = new Types.ObjectId(id)
        const data = {...dto,companyId:objId}
        console.log(data)
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
    
}
