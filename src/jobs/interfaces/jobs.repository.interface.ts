import { IBaseRepository } from "src/shared/interface/base-repository.interface"
import { createJobsDto } from "../dtos/createjobs.dto"
import { JobsDocument } from "../schema/jobs.schema"


export interface IJobsRepository extends IBaseRepository<JobsDocument> {
    // CreateJobs(id:string,dto:createJobsDto):Promise<JobsDocument | null>
}

export const JOBS_REPOSITORY = 'JOBS_REPOSITORY'