import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Stages } from '../schema/applications.schema';

export class CandidateApplicationsQueryDto {
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Stages)
  filtervalue?: Stages;
}
