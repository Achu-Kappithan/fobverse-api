import { CandidateProfileDocument } from '../../candiate/schema/candidate.profile.schema';
import { ApplicationDocument } from '../schema/applications.schema';

export type populatedapplicationList = ApplicationDocument & {
  profile?: CandidateProfileDocument;
  jobDetails?: any;
  candidateUser?: {
    _id: string;
    profileImg?: string;
    [key: string]: any;
  };
};

export type applicationPorfileDetails = ApplicationDocument & {
  profile?: CandidateProfileDocument;
  jobDetails?: any;
  candidateUser?: any;
};
