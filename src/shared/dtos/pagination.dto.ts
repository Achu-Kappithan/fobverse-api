import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, Min } from "class-validator";

export enum SortOrder {
    ASC= 'asc',
    DESC= 'desc'
}

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

}