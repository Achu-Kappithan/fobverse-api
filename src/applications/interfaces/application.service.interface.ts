import {
  PaginatedResponse,
  PlainResponse,
} from '../../admin/interfaces/responce.interface';
import { PaginatedApplicationDto } from '../dtos/application.pagination.dto';
import { ApplicationResponceDto } from '../dtos/application.responce';
import { CreateApplicationDto } from '../dtos/createapplication.dto';
import { updateAtsScoreDto } from '../dtos/update.atsScore.dto';
import { ApplicationDocument } from '../schema/applications.schema';
import { applicationResponce } from './responce.interface';

export interface IApplicationService {
  createApplication(
    dto: CreateApplicationDto,
    id: string,
    companyId: string,
  ): Promise<PlainResponse>;

  getAllApplications(
    companyId: string,
    dto: PaginatedApplicationDto,
  ): Promise<PaginatedResponse<ApplicationResponceDto[]>>;

  updateAtsScore(
    dto: updateAtsScoreDto,
    companyId: string,
  ): Promise<PaginatedResponse<ApplicationResponceDto[]>>;

  getjobDetails(
    appId: string,
    canId: string,
  ): Promise<applicationResponce<ApplicationResponceDto>>;

  updateStatus(
    appId: string,
    nextStage: string,
    interviewResult: string,
  ): Promise<ApplicationDocument | null>;
}

export const APPLICATION_SERVICE = 'APPLICATION_SERVICE';
