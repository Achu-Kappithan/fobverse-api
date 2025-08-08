import { Expose } from 'class-transformer';
import { jobType } from '../schema/jobs.schema';

export class ResponseJobsDto {

  @Expose()
  title: string;

  @Expose()
  _id:string

  @Expose()
  description: string;

  @Expose()
  responsibility:string

  @Expose()
  jobType:jobType

  @Expose()
  skills: string[];

  @Expose()
  experience: string[];

  @Expose()
  salary: {
    min: number;
    max: number;
  };

  @Expose()
  location: string[];

  @Expose()
  vacancies: number;

  @Expose()
  companyId: string;

  @Expose()
  endData:string

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
