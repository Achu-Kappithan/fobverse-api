import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { jobType } from "../schema/jobs.schema";
import { Type } from "class-transformer";

export class JobsDto {
    @IsNotEmpty()
    @IsString()
    title:string

    @IsNotEmpty()
    description:string

    @IsNotEmpty()
    responsibility:string

    @IsNotEmpty()
    jobType:jobType

    @IsNotEmpty()
    @IsString({each:true})
    skills:string[]

    @IsOptional({})
    experience?:string[]

    @IsNotEmpty()
    salary:{min:number,max:number}

    @IsNotEmpty()
    location:string

    @IsNotEmpty()
    dueDate?:string

    @IsNotEmpty()
    vacancies:string

}

export class jobsPagesAndFilterDto {
  @IsOptional()
  @Min(1)
  @Type(()=> Number)
  page?:number = 1

  @IsOptional()
  @Min(1)
  @Type(()=> Number)
  limit?:number = 6

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString({ each: true })
  jobType?: string[];

  @IsOptional()
  @Type(()=>Number)
  minSalary?: number;

  @IsOptional()
  @Type(()=>Number)
  maxSalary?: number;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  activeStatus?: string; 
}