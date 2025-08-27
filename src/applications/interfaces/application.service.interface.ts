import {
  PaginatedResponse,
  PlainResponse,
} from '../../admin/interfaces/responce.interface';
import { PaginatedApplicationDto } from '../dtos/application.pagination.dto';
import { ApplicationResponceDto } from '../dtos/application.responce';
import { CreateApplicationDto } from '../dtos/createapplication.dto';

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
}

export const APPLICATION_SERVICE = 'APPLICATION_SERVICE';
