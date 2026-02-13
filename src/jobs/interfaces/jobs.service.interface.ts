import { PaginatedResponse } from '../../shared/responses/api.response';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { ApiResponse } from '../../shared/responses/api.response';
import { JobsDto } from '../dtos/createjobs.dto';
import { populatedjobResDto } from '../dtos/populated.jobs.dto';
import { ResponseJobsDto } from '../dtos/response.job.dto';
export interface IJobService {
  createJobs(id: string, dto: JobsDto): Promise<ApiResponse<ResponseJobsDto>>;
  getAllJobs(
    id: string | null,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<ResponseJobsDto[]>>;
  getJobDetails(id: string): Promise<ApiResponse<ResponseJobsDto>>;
  updateJobDetails(
    id: string,
    dto: JobsDto,
  ): Promise<ApiResponse<ResponseJobsDto>>;
  populatedJobView(id: string): Promise<ApiResponse<populatedjobResDto>>;
}
export const JOBS_SERVICE = 'JOBS_SERVICE';
