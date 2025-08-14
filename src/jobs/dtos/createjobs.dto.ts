import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { jobType } from "../schema/jobs.schema";

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