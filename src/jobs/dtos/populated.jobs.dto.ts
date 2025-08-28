import { CompanyProfileResponseDto } from '../../company/dtos/responce.allcompany';
import { ResponseJobsDto } from './responce.job.dto';

export class populatedjobResDto {
  jobDetails: ResponseJobsDto;
  profile: CompanyProfileResponseDto[];
}
