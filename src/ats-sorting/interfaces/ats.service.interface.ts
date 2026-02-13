import { ResponseJobsDto } from '../../jobs/dtos/response.job.dto';
export interface IAtsService {
  parsePdfFormUrl(url: string): Promise<string>;
  calculateScore(
    jobDetails: ResponseJobsDto | undefined,
    resumeText: string,
  ): number;
}
export const ATS_SERVICE = 'ATS_SERVICE';
