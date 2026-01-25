import { CandidateProfileResponseDto } from '../dtos/candidate-responce.dto';
import { CreateCandidateProfileDto } from '../dtos/create-candidate-profile.dto';
import { UpdateCandidateProfileDto } from '../dtos/update-candidate-profile.dto';
import { CandidateProfileDocument } from '../schema/candidate.profile.schema';
import { CandidateResponceInterface } from './responce.interface';
import { CompanyProfileResponseDto } from '../../company/dtos/responce.allcompany';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { PaginatedResponse } from '../../admin/interfaces/responce.interface';

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
}

export const CANDIDATE_SERVICE = 'CANDIDATE_SERVICE';
