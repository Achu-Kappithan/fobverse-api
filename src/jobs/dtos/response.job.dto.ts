import { Expose, Type } from 'class-transformer';
import { jobType } from '../schema/jobs.schema';
import { Types } from 'mongoose';
export class SalaryDto {
  @Expose()
  min: number;
  @Expose()
  max: number;
}
export class CompanyIdDto {
  @Expose()
  _id: string;
  @Expose()
  name: string;
  @Expose()
  logoUrl: string;
}
export class populatedcompanyId {
  _id: Types.ObjectId;
  name: string;
  logoUrl: string;
}
export class ResponseJobsDto {
  @Expose()
  title: string;
  @Expose()
  _id: string;
  @Expose()
  description: string;
  @Expose()
  responsibility: string;
  @Expose()
  jobType: jobType;
  @Expose()
  skills: string[];
  @Expose()
  experience: string[];
  @Expose()
  @Type(() => SalaryDto)
  salary: SalaryDto;
  @Expose()
  location: string[];
  @Expose()
  vacancies: number;
  @Expose()
  @Type(() => CompanyIdDto)
  companyId: string | CompanyIdDto;
  @Expose()
  dueDate: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  activeStatus: boolean;
}
export class AllJobsAdminResponse {
  @Expose()
  title: string;
  @Expose()
  _id: string;
  @Expose()
  vacancies: number;
  @Expose()
  @Type(() => CompanyIdDto)
  companyId: string | CompanyIdDto;
  @Expose()
  activeStatus: boolean;
  @Expose()
  createdAt: Date;
  @Expose()
  jobType: jobType;
}
