import { Injectable } from "@nestjs/common";
import { IJobsRepository } from "../interfaces/jobs.repository.interface";
import { Jobs, JobsDocument } from "../schema/jobs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, UpdateResult } from "mongoose";
import { BaseRepository } from "../../shared/repositories/base.repository";

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

  async findAllJobs(
    filter:FilterQuery<JobsDocument>={},
    options?:{
      limit?:number,
      skip:number,
      sort?:Record<string, -1| 1>
      projection?:any
    }
  ):Promise<{ data:JobsDocument[]; total: number }>{
    const query = this.jobModel.find(filter,options?.projection)
    .populate('companyId', 'name')

    if (options?.sort) {
      query.sort(options.sort);
    } else {
      query.sort({ createdAt: -1 });
    }

    if (options?.skip !== undefined) {
      query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query.limit(options.limit);
    }

    const [data, total] = await Promise.all([
      query.exec(),
      this.jobModel.countDocuments(filter).exec(), 
    ]);

    return { data, total };
  }

  async countDocuments(filter: FilterQuery<any> = {}): Promise<number> {
    return this.jobModel.countDocuments(filter).exec();
  }
}