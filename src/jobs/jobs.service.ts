import { Inject, Injectable, Logger } from '@nestjs/common';
import { IJobService } from './interfaces/jobs.service.interface';
import { ResponseJobsDto } from './dtos/responce.job.dto';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from './interfaces/jobs.repository.interface';
import { FilterQuery, Types } from 'mongoose';
import { ApiResponce } from '../shared/interface/api.responce';
import { MESSAGES } from '../shared/constants/constants.messages';
import { PaginatedResponse } from '../admin/interfaces/responce.interface';
import { JobsDto, jobsPagesAndFilterDto } from './dtos/createjobs.dto';
import { Jobs } from './schema/jobs.schema';
import { populatedjobResDto } from './dtos/populated.jobs.dto';
import { MappingUtil } from '../shared/utils/mapping.util';
import { PaginationUtil } from '../shared/utils/pagination.util';
import { CompanyProfileResponseDto } from '../company/dtos/responce.allcompany';

@Injectable()
export class JobsService implements IJobService {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly _jobRepository: IJobsRepository,
  ) {}
  logger = new Logger(JobsService.name);

  // creating Jobs

  async createJobs(
    id: string,
    dto: JobsDto,
  ): Promise<ApiResponce<ResponseJobsDto>> {
    this.logger.log(
      `[JobService] data get for registration id: ${id} data: ${JSON.stringify(dto)}`,
    );
    const objId = new Types.ObjectId(id);
    const data: Partial<Jobs> = { ...dto, companyId: objId };
    const jobData = await this._jobRepository.create(data);

    this.logger.log(`[JobService] new job created ${JSON.stringify(jobData)}`);

    const mappedData = MappingUtil.map(ResponseJobsDto, jobData);
    return {
      message: MESSAGES.COMPANY.NEW_JOB_ADDED,
      data: mappedData,
    };
  }

  //for geting Alljobs

  async getAllJobs(
    id: string | null,
    pagination: jobsPagesAndFilterDto,
  ): Promise<PaginatedResponse<ResponseJobsDto[]>> {
    const {
      search,
      page = 1,
      limit = 4,
      jobType,
      minSalary,
      maxSalary,
    } = pagination;
    const filter: FilterQuery<Jobs> = {};

    if (search) {
      filter.title = { $regex: `^${search}`, $options: 'i' };
    }

    if (jobType && jobType.length > 0) {
      filter.jobType = { $in: jobType };
    }

    if (minSalary || maxSalary) {
      if (!filter.$and) {
        filter.$and = [];
      }

      if (minSalary !== undefined && minSalary !== null) {
        filter.$and.push({ 'salary.max': { $gte: Number(minSalary) } });
      }

      if (maxSalary !== undefined && maxSalary !== null) {
        filter.$and.push({ 'salary.min': { $lte: Number(maxSalary) } });
      }
    }

    if (id && id !== 'null' && id !== 'undefined') {
      const companyId = new Types.ObjectId(id);
      filter.companyId = companyId;
    }

    this.logger.log(
      `[JobServie] comapny id for get All jobs :${id} and query ${JSON.stringify(filter)} `,
    );
    const skip = (page - 1) * limit;

    const { data, total } = await this._jobRepository.findAllJobs(filter, {
      skip,
      limit,
    });
    const mappedData = MappingUtil.map(ResponseJobsDto, data);

    return PaginationUtil.toPaginatedResponse(
      mappedData,
      total,
      page,
      limit,
      MESSAGES.COMPANY.FETCH_ALL_JOBS,
    );
  }

  //show job Details

  async getJobDetails(id: string): Promise<ApiResponce<ResponseJobsDto>> {
    const data = await this._jobRepository.findById(id);
    this.logger.log(
      `[jobService] find jobDetails id: ${id} data: ${JSON.stringify(data)}`,
    );
    return {
      message: MESSAGES.COMPANY.GET_JOBDETAIS,
      data: MappingUtil.map(ResponseJobsDto, data),
    };
  }

  async populatedJobView(id: string): Promise<ApiResponce<populatedjobResDto>> {
    const data = await this._jobRepository.publicJobView(id);

    const mappedJob = MappingUtil.map(ResponseJobsDto, data);

    const mappedProfile = MappingUtil.map(
      CompanyProfileResponseDto,
      data.profile,
    );

    return {
      message: MESSAGES.COMPANY.GET_JOBDETAIS,
      data: {
        jobDetails: mappedJob,
        profile: mappedProfile,
      },
    };
  }

  async updateJobDetails(
    id: string,
    dto: JobsDto,
  ): Promise<ApiResponce<ResponseJobsDto>> {
    const data = await this._jobRepository.update({ _id: id }, { $set: dto });

    return {
      message: MESSAGES.COMPANY.UPDATE_JOBS,
      data: MappingUtil.map(ResponseJobsDto, data),
    };
  }
}
