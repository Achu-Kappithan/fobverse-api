import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createJobsDto {
    @IsNotEmpty()
    @IsString()
    title:string

    @IsNotEmpty()
    discription:string

    @IsNotEmpty()
    @IsString({each:true})
    skills:string[]

    @IsOptional({})
    experience?:string[]

    @IsNotEmpty()
    salary:{min:number,max:number}

    @IsNotEmpty()
    location:string

}