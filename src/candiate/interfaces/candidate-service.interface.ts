import { CandidateProfileResponseDto } from '../dtos/candidate-responce.dto';
import { CreateCandidateProfileDto } from '../dtos/create-candidate-profile.dto';
import { UpdateCandidateProfileDto } from '../dtos/update-candidate-profile.dto';
import { CandidateProfileDocument } from '../schema/candidate.profile.schema';
import { CandidateResponceInterface } from './responce.interface';
import { CompanyProfileResponseDto } from '../../company/dtos/responce.allcompany';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { PaginatedResponse } from '../../admin/interfaces/responce.interface';
import { CandidateApplicationResponseDto } from '../../applications/dtos/candidate-application.response.dto';
import { CandidateApplicationsQueryDto } from '../../applications/dtos/candidate-applications-query.dto';
import { AllStagesResponseDto } from '../../interview/dtos/all-stages-response.dto';

export interface ICandidateService {
  findByEmail(email: string): Promise<CandidateProfileDocument | null>;
  findById(id: string): Promise<CandidateProfileDocument | null>;
  findAllCandidate(): Promise<CandidateProfileDocument[] | null>;
  createPorfile(
    dto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto>;
  getProfile(
    id: string,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>>;
  updateProfile(
    dto: UpdateCandidateProfileDto,
    id: string,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>>;
  publicView(
    id: string,
  ): Promise<CandidateResponceInterface<CandidateProfileResponseDto>>;

  getAllCompanies(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<CompanyProfileResponseDto[]>>;

  getMyApplications(
    candidateId: string,
    dto: CandidateApplicationsQueryDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>>;

  getApplicationStages(
    applicationId: string,
  ): Promise<CandidateResponceInterface<AllStagesResponseDto>>;

  getHomeDataPublic(): Promise<CandidateResponceInterface<{ jobs: any[]; companies: any[] }>>;
}

export const CANDIDATE_SERVICE = 'CANDIDATE_SERVICE';
