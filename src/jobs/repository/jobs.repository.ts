import { Injectable } from "@nestjs/common";
import { IJobsRepository } from "../interfaces/jobs.repository.interface";
import { BaseRepository } from "src/shared/repositories/base.repository";
import { JobsDocument } from "../schema/jobs.schema";
import { createJobsDto } from "../dtos/createjobs.dto";

@Injectable()
export class JobRepository extends BaseRepository<JobsDocument> implements IJobsRepository {

}