import { PaginatedResponse } from '../../admin/interfaces/responce.interface';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { ApiResponce } from '../../shared/interface/api.responce';
import { JobsDto } from '../dtos/createjobs.dto';
import { populatedjobResDto } from '../dtos/populated.jobs.dto';
import { ResponseJobsDto } from '../dtos/responce.job.dto';

export interface IJobService {
  createJobs(id: string, dto: JobsDto): Promise<ApiResponce<ResponseJobsDto>>;

  getAllJobs(
    id: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<ResponseJobsDto[]>>;

  getJobDetails(id: string): Promise<ApiResponce<ResponseJobsDto>>;

  updateJobDetails(
    id: string,
    dto: JobsDto,
  ): Promise<ApiResponce<ResponseJobsDto>>;

  populatedJobView(id: string): Promise<ApiResponce<populatedjobResDto>>;
}

export const JOBS_SERVICE = 'JOBS_SERVICE';
