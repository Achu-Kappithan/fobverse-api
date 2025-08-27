import { IsNotEmpty } from 'class-validator';
import { PaginationDto } from '../../shared/dtos/pagination.dto';

export class PaginatedApplicationDto extends PaginationDto {
  @IsNotEmpty()
  jobId: string;
}
