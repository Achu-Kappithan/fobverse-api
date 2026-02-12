import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IComapnyService } from './interface/profile.service.interface';
import {
  COMAPNY_REPOSITORY,
  IcompanyRepository,
} from './interface/profile.repository.interface';
import { CreateProfileDto } from './dtos/create.profile.dto';
import {
  CompanyProfileResponseDto,
  UserResponseDto,
} from './dtos/response.allcompany';
import { ApiResponse } from '../shared/responses/api.response';
import { MappingUtil } from '../shared/utils/mapping.util';
import { PaginationUtil } from '../shared/utils/pagination.util';
import {
  changePassDto,
  InternalUserDto,
  TeamMemberDto,
  UpdateInternalUserDto,
  UpdateProfileDto,
} from './dtos/update.profile.dtos';
import { FilterQuery, Types } from 'mongoose';
import {
  AUTH_SERVICE,
  IAuthService,
} from '../auth/interfaces/IAuthCandiateService';
import { MESSAGES } from '../shared/constants/constants.messages';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { populateProfileDto } from './dtos/populatedprofile.res.dto';
import { ResponseJobsDto } from '../jobs/dtos/response.job.dto';
import { PaginatedResponse } from '../shared/responses/api.response';

import { CompanyProfileDocument } from './schema/company.profile.schema';
import {
  JOBS_REPOSITORY,
  IJobsRepository,
} from '../jobs/interfaces/jobs.repository.interface';
import {
  APPLICATION_REPOSITORY,
  IApplicationRepository,
} from '../applications/interfaces/application.repository.interface';
import {
  INTERVIEW_REPOSITORY,
  IInterviewRepository,
} from '../interview/interfaces/interview.repository.interface';
import {
  DashboardResponseDto,
  DashboardStatsDto,
  JobStatDto,
} from './dtos/dashboard.dto';
import { ApplicationResponseDto } from '../applications/dtos/application.response';
import { ScheduleResponseDto } from '../interview/dtos/interview.response.dto';

@Injectable()
export class CompanyService implements IComapnyService {
  logger = new Logger(CompanyService.name);
  constructor(
    @Inject(COMAPNY_REPOSITORY)
    private readonly _companyRepository: IcompanyRepository,
    @Inject(forwardRef(() => AUTH_SERVICE))
    private readonly _AuthService: IAuthService,
    @Inject(JOBS_REPOSITORY)
    private readonly _jobRepository: IJobsRepository,
    @Inject(APPLICATION_REPOSITORY)
    private readonly _applicationRepository: IApplicationRepository,
    @Inject(INTERVIEW_REPOSITORY)
    private readonly _interviewRepository: IInterviewRepository,
  ) {}

  //for updating bolock /unblock Status
  async createProfile(
    dto: CreateProfileDto,
  ): Promise<CompanyProfileResponseDto> {
    this.logger.debug(
      `[CompanyService] creating new company profiel${dto.name}`,
    );
    const updateDto = {
      name: dto.name,
      adminUserId: new Types.ObjectId(dto.UserId),
    };
    const newProfile = await this._companyRepository.create(updateDto);
    this.logger.debug(
      `[CompanyService] new profile created ${JSON.stringify(newProfile)}`,
    );
    if (!newProfile) {
      throw new InternalServerErrorException(
        MESSAGES.AUTH.PROFILE_CREATION_FAIILD,
      );
    }

    return MappingUtil.map(CompanyProfileResponseDto, newProfile);
  }

  // for fetching company profile

  async getProfile(
    id: string,
  ): Promise<ApiResponse<CompanyProfileResponseDto>> {
    const profiledata = await this._companyRepository.findById(id);
    return {
      message: MESSAGES.COMPANY.PROFILE_FETCH_SUCCESS,
      data: MappingUtil.map(CompanyProfileResponseDto, profiledata),
    };
  }

  // get Public Profile

  async getPublicProfile(id: string): Promise<ApiResponse<populateProfileDto>> {
    const profiledata = await this._companyRepository.publicPorfile(id);

    if (!profiledata) {
      throw new NotFoundException('Company not found');
    }

    const mappedProfile = MappingUtil.map(
      CompanyProfileResponseDto,
      profiledata,
    );

    const mappedJobs = MappingUtil.map(ResponseJobsDto, profiledata.jobs);

    const mappedData: populateProfileDto = {
      company: mappedProfile,
      jobs: mappedJobs,
    };

    return {
      message: MESSAGES.COMPANY.PROFILE_FETCH_SUCCESS,
      data: mappedData,
    };
  }
  // updating profile  wiht new data

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<CompanyProfileResponseDto>> {
    const updatedata = await this._companyRepository.update(
      { _id: id },
      { $set: dto },
    );

    return {
      message: MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
      data: MappingUtil.map(CompanyProfileResponseDto, updatedata),
    };
  }

  //add internal users to the company

  async createUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const data = await this._AuthService.createInternalUser(id, dto);
    return {
      message: MESSAGES.COMPANY.USER_REG_SUCCESS,
      data: data,
    };
  }

  // get all Internal users

  async getInternalUsers(
    companyId: string,
    userId: string,
    pagination: PaginationDto,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    this.logger.log(
      `[ComapanyService] id get in Comapny service :${companyId}`,
    );
    return await this._AuthService.getAllUsers(companyId, userId, pagination);
  }

  // get Hr Users

  async getHrUsers(companyId: string): Promise<ApiResponse<UserResponseDto[]>> {
    this.logger.log(`[companyService] fetch hr user of company ${companyId}`);
    return await this._AuthService.getHrUsers(companyId);
  }

  // get Interviewers

  async getInterviewers(
    companyId: string,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    this.logger.log(
      `[companyService] fetch Interviewers of company ${companyId}`,
    );
    return await this._AuthService.getInterviewers(companyId);
  }

  //getUserProfile

  async getUserProfile(id: string): Promise<ApiResponse<UserResponseDto>> {
    this.logger.log(`[ComapayService] try to getUser Profile ${id}`);
    const userProfile = await this._AuthService.getUserProfile(id);
    return {
      message: MESSAGES.COMPANY.USER_PROFILE_GET,
      data: userProfile,
    };
  }

  //updateUserProfile

  async updateUserProfile(
    id: string,
    dto: UpdateInternalUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const data = await this._AuthService.updateUserProfile(id, dto);
    return {
      message: MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
      data: data,
    };
  }

  // update Password

  async updatePassword(
    id: string,
    dto: changePassDto,
  ): Promise<ApiResponse<unknown>> {
    return await this._AuthService.changePassword(id, dto);
  }

  //addTeamMembers

  async addTeamMembers(
    id: string,
    dto: TeamMemberDto,
  ): Promise<ApiResponse<CompanyProfileResponseDto>> {
    const data = await this._companyRepository.addTeamMembers(id, dto);

    return {
      message: MESSAGES.COMPANY.PROFILE_UPDATE_SUCCESS,
      data: MappingUtil.map(CompanyProfileResponseDto, data),
    };
  }

  async removeUser(id: string): Promise<ApiResponse<unknown>> {
    return await this._AuthService.removeUser(id);
  }

  async getAllCompanies(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    const { page = 1, limit = 6, search } = pagination;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<CompanyProfileDocument> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
      ];
    }

    const { data: companies, total } =
      await this._companyRepository.findManyWithPagination(filter, {
        limit,
        skip,
      });

    const mappedData = MappingUtil.map(CompanyProfileResponseDto, companies);

    return PaginationUtil.toPaginatedResponse(
      mappedData,
      total,
      page,
      limit,
      MESSAGES.COMPANY.PROFILE_FETCH_SUCCESS,
    );
  }

  async getDashboardData(
    companyId: string,
  ): Promise<ApiResponse<DashboardResponseDto>> {
    const comId = new Types.ObjectId(companyId);

    const [
      statsRepo,
      totalJobs,
      { data: recentAppsRaw },
      jobStatsData,
      upcomingInterviewsRaw,
    ] = await Promise.all([
      this._applicationRepository.getDashboardStats(comId),
      this._jobRepository.count({ companyId: comId }),
      this._applicationRepository.populatedApplicationList(
        { companyId: comId },
        { limit: 5, sort: { createdAt: -1 } },
      ),
      this._applicationRepository.getJobApplicationStats(comId),
      this._interviewRepository.getUpcomingInterviewsForCompany(companyId, 5),
    ]);

    const stats: DashboardStatsDto = {
      ...statsRepo,
      totalJobs: totalJobs,
      activeJobs: totalJobs,
      interviewsScheduled: upcomingInterviewsRaw.length,
    };

    const recentApplications = MappingUtil.map(
      ApplicationResponseDto,
      recentAppsRaw,
    );

    const jobStats = MappingUtil.map(JobStatDto, jobStatsData);

    const upcomingInterviews = MappingUtil.map(
      ScheduleResponseDto,
      upcomingInterviewsRaw,
    );

    const dashboardData: DashboardResponseDto = {
      stats,
      recentApplications: recentApplications,
      upcomingInterviews: upcomingInterviews,
      jobStats: jobStats,
    };

    return {
      message: 'Dashboard data fetched successfully',
      data: dashboardData,
    };
  }
}
