import { ApiResponce } from "src/shared/interface/api.responce"
import { createJobsDto } from "../dtos/createjobs.dto"
import { ResponseJobsDto } from "../dtos/responce.job.dto"
import { PaginationDto } from "src/shared/dtos/pagination.dto"
import { PaginatedResponse } from "src/admin/interfaces/responce.interface"


export interface IJobService {
    CreateJobs(id:string,dto:createJobsDto):Promise<ApiResponce<ResponseJobsDto>>

    getAllJobs(id:string,pagination:PaginationDto):Promise<PaginatedResponse<ResponseJobsDto[]>>
}

export const JOBS_SERVICE = 'JOBS_SERVICE'