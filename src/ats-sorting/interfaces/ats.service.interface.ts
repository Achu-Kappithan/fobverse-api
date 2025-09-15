import { ResponseJobsDto } from '../../jobs/dtos/responce.job.dto';

export interface IAtsService {
  // parseJobDisciption(jobData: ResponseJobsDto | undefined): string;

  parsePdfFormUrl(url: string): Promise<string>;

  calculateScore(
    jobDetails: ResponseJobsDto | undefined,
    resumeText: string,
  ): number;
}

export const ATS_SERVICE = 'ATS_SERVICE';
