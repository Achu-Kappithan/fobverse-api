import { PaginatedResponse } from '../shared/responses/api.response';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ICandidateService } from './interfaces/candidate-service.interface';
import {
  CANDIDATE_REPOSITORY,
  ICandidateRepository,
} from './interfaces/candidate-repository.interface';
import { CreateCandidateProfileDto } from './dtos/create-candidate-profile.dto';
import { CandidateProfileDocument } from './schema/candidate.profile.schema';
import { Types } from 'mongoose';
import { ApiResponse } from '../shared/responses/api.response';
import { CandidateProfileResponseDto } from './dtos/candidate-response.dto';
import { MappingUtil } from '../shared/utils/mapping.util';
import { UpdateCandidateProfileDto } from './dtos/update-candidate-profile.dto';
import { MESSAGES } from '../shared/constants/constants.messages';
import {
  COMPANY_SERVICE,
  IComapnyService,
} from '../company/interface/profile.service.interface';
import { CompanyProfileResponseDto } from '../company/dtos/response.allcompany';
import { ResponseJobsDto } from '../jobs/dtos/response.job.dto';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import {
  APPLICATION_SERVICE,
  IApplicationService,
} from '../applications/interfaces/application.service.interface';
import { CandidateApplicationResponseDto } from '../applications/dtos/candidate-application.response.dto';
import { CandidateApplicationsQueryDto } from '../applications/dtos/candidate-applications-query.dto';
import {
  IInterviewService,
  INTERVIEW_SERVICE,
} from '../interview/interfaces/interview.service.interface';
import { AllStagesResponseDto } from '../interview/dtos/all-stages-response.dto';
import {
  IJobService,
  JOBS_SERVICE,
} from '../jobs/interfaces/jobs.service.interface';
import { changePassDto } from '../company/dtos/update.profile.dtos';
import {
  AUTH_SERVICE,
  IAuthService,
} from '../auth/interfaces/IAuthCandiateService';
@Injectable()
export class CandidateService implements ICandidateService {
  private readonly _logger = new Logger(CandidateService.name);
  constructor(
    @Inject(CANDIDATE_REPOSITORY)
    private readonly _candidateRepository: ICandidateRepository,
    @Inject(COMPANY_SERVICE)
    private readonly _companyService: IComapnyService,
    @Inject(APPLICATION_SERVICE)
    private readonly _applicationService: IApplicationService,
    @Inject(INTERVIEW_SERVICE)
    private readonly _interviewService: IInterviewService,
    @Inject(JOBS_SERVICE)
    private readonly _jobService: IJobService,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService,
  ) {}
  async findByEmail(email: string): Promise<CandidateProfileDocument | null> {
    this._logger.debug(`Finding user by email: ${email}`);
    return this._candidateRepository.findByEmail(email);
  }
  async findById(id: string): Promise<CandidateProfileDocument | null> {
    this._logger.debug(`Finding user by Id:${id}`);
    return this._candidateRepository.findById(id);
  }
  async createProfile(
    dto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    this._logger.debug(
      `[CandidateService] Creating new candidate profile ${dto.name}`,
    );
    const updateDto = {
      name: dto.name,
      UserId: new Types.ObjectId(dto.UserId),
    };
    const newprofile = await this._candidateRepository.create(updateDto);
    this._logger.debug(`new profile created ${JSON.stringify(newprofile)}`);
    if (!newprofile) {
      throw new InternalServerErrorException(
        MESSAGES.AUTH.PROFILE_CREATION_FAILED,
      );
    }
    return MappingUtil.map(CandidateProfileResponseDto, newprofile);
  }
  async findAllCandidate(): Promise<CandidateProfileDocument[] | null> {
    return await this._candidateRepository.findAll();
  }
  async getProfile(
    id: string,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    const userId = new Types.ObjectId(id);
    const ProfileData = await this._candidateRepository.findOne({
      UserId: userId,
    });
    if (!ProfileData) {
      throw new NotFoundException(MESSAGES.CANDIDATE.PROFILE_FETCH_FAIL);
    }
    return {
      message: MESSAGES.CANDIDATE.PROFILE_FETCH_SUCCESS,
      data: MappingUtil.map(CandidateProfileResponseDto, ProfileData),
    };
  }
  async updateProfile(
    dto: UpdateCandidateProfileDto,
    id: string,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    this._logger.debug(
      `[CandidateService] data get frondend for updating candidate profile id is : ${id} data :${JSON.stringify(dto)}`,
    );
    const userId = new Types.ObjectId(id);
    const profileData = await this._candidateRepository.update(
      { UserId: userId },
      { $set: dto },
    );
    if (!profileData) {
      throw new NotFoundException(MESSAGES.CANDIDATE.PROFILE_UPDATE_FAIL);
    }
    this._logger.log(
      `[CandidateService], updated profile data ${JSON.stringify(profileData)}`,
    );
    return {
      message: MESSAGES.CANDIDATE.PROFILE_UPDATE_SUCCESS,
      data: MappingUtil.map(CandidateProfileResponseDto, profileData),
    };
  }
  async publicView(
    id: string,
  ): Promise<ApiResponse<CandidateProfileResponseDto>> {
    const ProfileData = await this._candidateRepository.findById(id);
    if (!ProfileData) {
      throw new NotFoundException(MESSAGES.CANDIDATE.PROFILE_FETCH_FAIL);
    }
    return {
      message: MESSAGES.CANDIDATE.PROFILE_FETCH_SUCCESS,
      data: MappingUtil.map(CandidateProfileResponseDto, ProfileData),
    };
  }
  async getAllCompanies(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>> {
    return this._companyService.getAllCompanies(pagination);
  }
  async getMyApplications(
    candidateId: string,
    dto: CandidateApplicationsQueryDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>> {
    this._logger.log(
      `[CandidateService] Fetching applications for candidate: ${candidateId}`,
    );
    return await this._applicationService.getCandidateApplications(
      candidateId,
      dto,
    );
  }
  async getApplicationStages(
    applicationId: string,
  ): Promise<ApiResponse<AllStagesResponseDto>> {
    this._logger.log(
      `[CandidateService] Fetching all stages for applicationId: ${applicationId}`,
    );
    const stages =
      await this._interviewService.getAllStagesByApplicationId(applicationId);
    if (!stages.data) {
      throw new NotFoundException('Stages data not found');
    }
    return {
      message: stages.message,
      data: stages.data,
    };
  }
  async getHomeDataPublic(): Promise<
    ApiResponse<{
      jobs: ResponseJobsDto[];
      companies: CompanyProfileResponseDto[];
    }>
  > {
    const [jobs, companies] = await Promise.all([
      this._jobService.getAllJobs(null, { page: 1, limit: 6 }),
      this._companyService.getAllCompanies({ page: 1, limit: 4 }),
    ]);
    return {
      message: 'Home data fetched successfully',
      data: {
        jobs: jobs.data,
        companies: companies.data,
      },
    };
  }
  async updatePassword(
    id: string,
    dto: changePassDto,
  ): Promise<ApiResponse<unknown>> {
    this._logger.log(`[CandidateService] Updating password for user Id: ${id}`);
    return this._authService.changePassword(id, dto);
  }
}
