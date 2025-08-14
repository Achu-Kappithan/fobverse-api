import { Expose } from 'class-transformer';
import { jobType } from '../schema/jobs.schema';
import { Types } from 'mongoose';

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
  dueDate:string

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  activeStatus:boolean
}


export class AllJobsAdminResponce {
  @Expose()
  title:string

  @Expose()
  _id:string

  @Expose()
  vacancies: number;

  @Expose()
  companyId: string |{ _id: Types.ObjectId; name: string }

  @Expose()
  activeStatus:boolean

  @Expose()
  createdAt: Date;

  @Expose()
  jobType:jobType
}
