import { ResponseJobsDto } from '../../jobs/dtos/response.job.dto';
import { CompanyProfileResponseDto } from './response.allcompany';

export class populateProfileDto {
  readonly company: CompanyProfileResponseDto;
  readonly jobs: ResponseJobsDto[];
}
