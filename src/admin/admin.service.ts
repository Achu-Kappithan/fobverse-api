import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IAdminService } from './interfaces/IAdminService';
import {
  PaginatedResponse,
  PlainResponse,
} from './interfaces/responce.interface';
import { plainToInstance } from 'class-transformer';
import { FilterQuery, Types } from 'mongoose';
import {
  COMAPNY_REPOSITORY,
  IcompanyRepository,
} from '../company/interface/profile.repository.interface';
import {
  CANDIDATE_REPOSITORY,
  ICandidateRepository,
} from '../candiate/interfaces/candidate-repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../jobs/interfaces/jobs.repository.interface';
import {
  APPLICATION_REPOSITORY,
  IApplicationRepository,
} from '../applications/interfaces/application.repository.interface';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import {
  CompanyProfileResponseDto,
  UserResponceDto,
} from '../company/dtos/responce.allcompany';
import { CompanyProfile } from '../company/schema/company.profile.schema';
import { CandidateProfileResponseDto } from '../candiate/dtos/candidate-responce.dto';
import { CandidateProfile } from '../candiate/schema/candidate.profile.schema';
import { Jobs } from '../jobs/schema/jobs.schema';
import { AllJobsAdminResponce } from '../jobs/dtos/responce.job.dto';
import { MESSAGES } from '../shared/constants/constants.messages';
import {
  AUTH_SERVICE,
  IAuthService,
} from '../auth/interfaces/IAuthCandiateService';
import { ApiResponce } from '../shared/interface/api.responce';
import { changePassDto } from '../company/dtos/update.profile.dtos';
import { generalResponce } from '../auth/interfaces/api-response.interface';
import { UpdateAdminProfileDto } from './dtos/admin-profile.dto';
import { AdminDashboardDto } from './dtos/admin-dashboard.dto';
import { jobType } from '../jobs/schema/jobs.schema';

@Injectable()
export class AdminService implements IAdminService {
  logger = new Logger(AdminService.name);
  constructor(
    @Inject(COMAPNY_REPOSITORY)
    private readonly _companyRepository: IcompanyRepository,
    @Inject(CANDIDATE_REPOSITORY)
    private readonly _candidateRepository: ICandidateRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly _jobsRepository: IJobsRepository,
    @Inject(APPLICATION_REPOSITORY)
    private readonly _applicationRepository: IApplicationRepository,
    @Inject(AUTH_SERVICE)
    readonly _authService: IAuthService,
  ) {}

  async getAllCompnys(
    dto: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    const { page = 1, limit = 6, search } = dto;
    const filter: FilterQuery<CompanyProfile> = {};
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }];
    }
    const skip = (page - 1) * limit;
    this.logger.debug(
      `[AdminService] Fetching companies with: Page ${page}, Limit ${limit}, Search "${search || 'N/A'}"`,
    );

    const { data, total } =
      await this._companyRepository.findManyWithPagination(filter, {
        limit,
        skip,
      });

    this.logger.debug(
      `[AdminService] Found ${data.length} companies on page, Total ${total}`,
    );
    const mappedData = plainToInstance(
      CompanyProfileResponseDto,
      data.map((doc) => {
        const obj = doc.toObject({ getters: true, virtuals: false });
        return {
          ...obj,
          _id: obj._id.toString(),
          adminUserId: obj.adminUserId ? obj.adminUserId.toString() : undefined,
        };
      }),
      { excludeExtraneousValues: true },
    );

    const totalPages = Math.ceil(total / limit);
    return {
      message: MESSAGES.ADMIN.DATA_RETRIEVED,
      data: mappedData,
      currentPage: page,
      totalItems: total,
      totalPages: totalPages,
      itemsPerPage: limit,
    };
  }

  async getAllCandidates(
    dto: PaginationDto,
  ): Promise<PaginatedResponse<CandidateProfileResponseDto[]>> {
    const { page = 1, limit = 6, search } = dto;

    const filter: FilterQuery<CandidateProfile> = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    this.logger.debug(
      `[AdminService] Fetching companies with: Page ${page}, Limit ${limit}, Search "${search || 'N/A'}"`,
    );

    const { data, total } =
      await this._candidateRepository.findManyWithPagination(filter, {
        limit,
        skip,
      });

    this.logger.debug(
      `[adminService] fetch all candidate data ${JSON.stringify(data)}`,
    );
    const mapdeData = plainToInstance(
      CandidateProfileResponseDto,
      data.map((doc) => {
        const obj = doc.toObject({ getters: true, virtuals: true });
        return {
          ...obj,
          id: obj._id.toString(),
          UserId: obj.UserId.toString(),
        };
      }),
      { excludeExtraneousValues: true },
    );
    const totalpages = Math.ceil(total / limit);
    this.logger.log(
      `[AdminService] mapped data of company for fetching ${JSON.stringify(mapdeData)}`,
    );
    return {
      message: MESSAGES.ADMIN.DATA_RETRIEVED,
      data: mapdeData,
      currentPage: page,
      totalItems: total,
      totalPages: totalpages,
      itemsPerPage: limit,
    };
  }

  async updateCompanyStatus(id: string): Promise<PlainResponse> {
    const data = await this._companyRepository.updateStatus(id);
    this.logger.debug(
      `[AdminService] status Updated data ${JSON.stringify(data)}`,
    );
    return {
      message: MESSAGES.ADMIN.STATUS_UPDATED,
    };
  }

  async updateCandidateStatus(id: string): Promise<PlainResponse> {
    const data = await this._candidateRepository.updateStatus(id);
    this.logger.debug(
      `[AdminService] status Updated data ${JSON.stringify(data)}`,
    );
    return {
      message: MESSAGES.ADMIN.STATUS_UPDATED,
    };
  }

  async getAllJobs(
    dto: PaginationDto,
  ): Promise<PaginatedResponse<AllJobsAdminResponce[]>> {
    const { search, page = 1, limit = 6 } = dto;

    const filter: FilterQuery<Jobs> = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    this.logger.log(
      `[AdminService] findAllCompanys Using ${JSON.stringify(filter)} , ${page} , ${limit}`,
    );

    const { data, total } = await this._jobsRepository.findAllJobs(filter, {
      limit,
      skip,
    });
    this.logger.log(
      `[AdminService] All jobs Data  gets from the db ${JSON.stringify(data)}`,
    );

    const plainData = data.map((val) => {
      const company = val.companyId as { _id: Types.ObjectId; name: string };
      return {
        ...val.toJSON(),
        _id: val._id.toString(),
        companyId: company.name,
      };
    });

    const mapdeData = plainToInstance(AllJobsAdminResponce, plainData, {
      excludeExtraneousValues: true,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      message: MESSAGES.ADMIN.FETCH_ALL_JOBS,
      data: mapdeData,
      totalItems: total,
      currentPage: page,
      totalPages: totalPages,
      itemsPerPage: limit,
    };
  }

  async updateJobStatus(id: string): Promise<PlainResponse> {
    const res = await this._jobsRepository.UpdatejobStatus(id);
    if (!res.acknowledged) {
      throw new BadRequestException('Unable to Update the status');
    }
    return {
      message: MESSAGES.ADMIN.STATUS_UPDATED,
    };
  }

  async getAdminProfile(id: string): Promise<ApiResponce<UserResponceDto>> {
    this.logger.log(`[AdminService] try to getUser Profile ${id}`);
    const userProfile = await this._authService.getUserProfile(id);
    return {
      message: MESSAGES.ADMIN.PROFILE_GET,
      data: userProfile,
    };
  }

  async updatePassword(
    id: string,
    dto: changePassDto,
  ): Promise<generalResponce> {
    return await this._authService.changePassword(id, dto);
  }

  async upateUserProfile(
    id: string,
    dto: UpdateAdminProfileDto,
  ): Promise<ApiResponce<UserResponceDto>> {
    const data = await this._authService.updateUserProfile(id, dto);
    return {
      message: MESSAGES.ADMIN.PROFILE_UPDATE_SUCCESS,
      data: data,
    };
  }

  async getDashboardStats(): Promise<ApiResponce<AdminDashboardDto>> {
    const [
      totalCandidates,
      totalCompanies,
      totalApplications,
      totalJobs,
      activeJobs,
    ] = await Promise.all([
      this._candidateRepository.count({}),
      this._companyRepository.count({}),
      this._applicationRepository.count({}),
      this._jobsRepository.count({}),
      this._jobsRepository.count({ activeStatus: true }),
    ]);

    const jobTypeStats = {
      fulltime: await this._jobsRepository.count({ jobType: jobType.FullTime }),
      parttime: await this._jobsRepository.count({
        jobType: jobType.PartTmime,
      }),
      remote: await this._jobsRepository.count({ jobType: jobType.Remote }),
      onsite: await this._jobsRepository.count({ jobType: jobType.OnSite }),
      internship: 0,
      contract: 0,
    };

    const { data: recentJobsData } = await this._jobsRepository.findAllJobs(
      {},
      { limit: 4, skip: 0, sort: { createdAt: -1 } },
    );

    const recentJobs = await Promise.all(
      recentJobsData.map(async (job) => {
        const company = job.companyId as { name: string; logoUrl?: string };
        const applicantsCount = await this._applicationRepository.count({
          jobId: job._id,
        });

        return {
          _id: job._id.toString(),
          title: job.title,
          companyName: company.name,
          location: job.location.join(', '),
          jobType: job.jobType,
          applicantsCount,
          logo: company.logoUrl || '',
        };
      }),
    );

    const dashboardStats: AdminDashboardDto = {
      totalCandidates,
      totalCompanies,
      totalApplications,
      totalJobs,
      activeJobs,
      jobTypeStats,
      recentJobs,
    };

    return {
      message: MESSAGES.ADMIN.DATA_RETRIEVED,
      data: dashboardStats,
    };
  }
}
