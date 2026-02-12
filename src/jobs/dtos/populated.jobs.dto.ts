import { CompanyProfileResponseDto } from '../../company/dtos/response.allcompany';
import { ResponseJobsDto } from './response.job.dto';

export class populatedjobResDto {
  jobDetails: ResponseJobsDto;
  profile: CompanyProfileResponseDto[];
}
