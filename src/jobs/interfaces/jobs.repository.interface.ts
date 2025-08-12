import { IBaseRepository } from "src/shared/interface/base-repository.interface"
import { JobsDocument } from "../schema/jobs.schema"
import { UpdateResult } from "mongoose"


export interface IJobsRepository extends IBaseRepository<JobsDocument> {
    UpdatejobStatus(id:string):Promise<UpdateResult>
}

export const JOBS_REPOSITORY = 'JOBS_REPOSITORY'