import { Expose } from 'class-transformer';

export class ResponseJobsDto {

  @Expose()
  title: string;

  @Expose()
  _id:string

  @Expose()
  description: string;

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
  location: string;

  @Expose()
  vacancies: number;

  @Expose()
  companyId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
