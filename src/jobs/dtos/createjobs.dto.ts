import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { jobType } from "../schema/jobs.schema";

export class createJobsDto {
    @IsNotEmpty()
    @IsString()
    title:string

    @IsNotEmpty()
    discription:string

    @IsNotEmpty()
    responsibility:string

    @IsNotEmpty()
    jobTye:jobType

    @IsNotEmpty()
    @IsString({each:true})
    skills:string[]

    @IsOptional({})
    experience?:string[]

    @IsNotEmpty()
    salary:{min:number,max:number}

    @IsNotEmpty()
    location:string

    @IsOptional()
    endDate?:string

}