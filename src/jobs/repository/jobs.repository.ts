import { Injectable } from "@nestjs/common";
import { IJobsRepository } from "../interfaces/jobs.repository.interface";
import { BaseRepository } from "src/shared/repositories/base.repository";
import { Jobs, JobsDocument } from "../schema/jobs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateResult } from "mongoose";

@Injectable()
export class JobRepository extends BaseRepository<JobsDocument> implements IJobsRepository {
    constructor(@InjectModel(Jobs.name) private readonly jobModel: Model<JobsDocument>) {
    super(jobModel);
  }

  async UpdatejobStatus(id:string):Promise<UpdateResult>{
    return await this.jobModel.updateOne({_id:id},[
      {
        $set:{
          activeStatus:{$not:'$activeStatus'}
        }
      }
    ])
  }
}