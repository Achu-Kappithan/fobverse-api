import { Type } from "class-transformer";
import {IsOptional, IsString, Min } from "class-validator";


export class PaginationDto {
    @IsOptional()
    @Min(1)
    @Type(()=> Number)
    page?:number = 1

    @IsOptional()
    @Min(1)
    @Type(()=> Number)
    limit?:number = 10

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    filtervalue?:string

}