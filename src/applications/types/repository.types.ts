import { CandidateProfileDocument } from '../../candiate/schema/candidate.profile.schema';
import { ApplicationDocument } from '../schema/applications.schema';
import { JobsDocument } from '../../jobs/schema/jobs.schema';

export type populatedapplicationList = ApplicationDocument & {
  profile?: CandidateProfileDocument;
  jobDetails?: JobsDocument;
  candidateUser?: {
    _id: string;
    profileImg?: string;
    [key: string]: any;
  };
};

export type applicationPorfileDetails = ApplicationDocument & {
  profile?: CandidateProfileDocument;
  jobDetails?: JobsDocument;
  candidateUser?: any;
};
