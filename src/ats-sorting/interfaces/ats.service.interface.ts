import { ResponseJobsDto } from '../../jobs/dtos/response.job.dto';

export interface AtsWorkerInput {
  applicationId: string;
  resumeUrl: string;
  cloudinaryBaseUrl: string;
  atsCriteria: number;
  jobDetails: {
    title: string;
    description: string;
    responsibility: string;
    skills: string[];
    location: string[];
  };
}

export type AtsWorkerOutput =
  | {
      success: true;
      applicationId: string;
      atsScore: number;
    }
  | {
      success: false;
      applicationId: string;
      error: string;
    };

export interface IAtsService {
  parsePdfFormUrl(url: string): Promise<string>;
  calculateScore(
    jobDetails: ResponseJobsDto | undefined,
    resumeText: string,
  ): number;
}

export const ATS_SERVICE = 'ATS_SERVICE';
