import { PlainResponse } from '../../admin/interfaces/responce.interface';
import { CreateApplicationDto } from '../dtos/createapplication.dto';

export interface IApplicationService {
  createApplication(
    dto: CreateApplicationDto,
    id: string,
  ): Promise<PlainResponse>;
}

export const APPLICATION_SERVICE = 'APPLICATION_SERVICE';
