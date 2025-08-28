import { ResponseJobsDto } from '../../jobs/dtos/responce.job.dto';
import { CompanyProfileResponseDto } from './responce.allcompany';

export class populateProfileDto {
  readonly company: CompanyProfileResponseDto;
  readonly jobs: ResponseJobsDto[];
}
