import {
  ApiResponse,
  PaginatedResponse,
} from '../../shared/responses/api.response';
import { PaginatedApplicationDto } from '../dtos/application.pagination.dto';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { ApplicationResponseDto } from '../dtos/application.response';
import { ApplicationDetailsResponseDto } from '../dtos/application-details.response.dto';
import { CreateApplicationDto } from '../dtos/createapplication.dto';
import { updateAtsScoreDto } from '../dtos/update.atsScore.dto';
import { ApplicationDocument } from '../schema/applications.schema';
import { CandidateApplicationResponseDto } from '../dtos/candidate-application.response.dto';
import { CandidateApplicationsQueryDto } from '../dtos/candidate-applications-query.dto';
export interface IApplicationService {
  createApplication(
    dto: CreateApplicationDto,
    id: string,
    companyId: string,
  ): Promise<ApiResponse<unknown>>;
  getAllApplications(
    companyId: string,
    dto: PaginatedApplicationDto,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>>;
  getCompanyApplicants(
    companyId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>>;
  updateAtsScore(
    dto: updateAtsScoreDto,
    companyId: string,
  ): Promise<PaginatedResponse<ApplicationResponseDto[]>>;
  getjobDetails(
    appId: string,
    canId: string,
  ): Promise<ApiResponse<ApplicationDetailsResponseDto>>;
  updateStatus(
    appId: string,
    nextStage?: string,
    interviewResult?: string,
  ): Promise<ApplicationDocument | null>;
  getCandidateApplications(
    candidateId: string,
    dto: CandidateApplicationsQueryDto,
  ): Promise<PaginatedResponse<CandidateApplicationResponseDto[]>>;
}
export const APPLICATION_SERVICE = 'APPLICATION_SERVICE';
