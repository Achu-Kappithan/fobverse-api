import { CandidateProfileResponseDto } from '../dtos/candidate-response.dto';
import { CreateCandidateProfileDto } from '../dtos/create-candidate-profile.dto';
import { UpdateCandidateProfileDto } from '../dtos/update-candidate-profile.dto';
import { CandidateProfileDocument } from '../schema/candidate.profile.schema';

import { CompanyProfileResponseDto } from '../../company/dtos/response.allcompany';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { CandidateApplicationResponseDto } from '../../applications/dtos/candidate-application.response.dto';
import { CandidateApplicationsQueryDto } from '../../applications/dtos/candidate-applications-query.dto';
import { AllStagesResponseDto } from '../../interview/dtos/all-stages-response.dto';
import { changePassDto } from '../../company/dtos/update.profile.dtos';
import {
  ApiResponse,
  PaginatedResponse,
} from '../../shared/responses/api.response';
import { ResponseJobsDto } from '../../jobs/dtos/response.job.dto';

export interface ICandidateService {
  findByEmail(email: string): Promise<CandidateProfileDocument | null>;
  findById(id: string): Promise<CandidateProfileDocument | null>;
  findAllCandidate(): Promise<CandidateProfileDocument[] | null>;
  createProfile(
    dto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto>;
  getProfile(id: string): Promise<ApiResponse<CandidateProfileResponseDto>>;
  updateProfile(
    dto: UpdateCandidateProfileDto,
    id: string,
  ): Promise<ApiResponse<CandidateProfileResponseDto>>;
  publicView(id: string): Promise<ApiResponse<CandidateProfileResponseDto>>;

  getAllCompanies(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>>;

  getMyApplications(
    candidateId: string,
    dto: CandidateApplicationsQueryDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>>;

  getApplicationStages(
    applicationId: string,
  ): Promise<ApiResponse<AllStagesResponseDto>>;

  getHomeDataPublic(): Promise<
    ApiResponse<{
      jobs: ResponseJobsDto[];
      companies: CompanyProfileResponseDto[];
    }>
  >;
  updatePassword(id: string, dto: changePassDto): Promise<ApiResponse<unknown>>;
}

export const CANDIDATE_SERVICE = 'CANDIDATE_SERVICE';
