import { ApiResponce } from "src/shared/interface/api.responce"
import { createJobsDto } from "../dtos/createjobs.dto"
import { ResponseJobsDto } from "../dtos/responce.job.dto"


export interface IJobService {
    CreateJobs(id:string,dto:createJobsDto):Promise<ApiResponce<ResponseJobsDto>>
}

export const JOBS_SERVICE = 'JOBS_SERVICE'