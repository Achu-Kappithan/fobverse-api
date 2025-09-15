import { CandidateProfileDocument } from '../../candiate/schema/candidate.profile.schema';
import { ApplicationDocument } from '../schema/applications.schema';

export type populatedapplicationList = ApplicationDocument & {
  profile: CandidateProfileDocument[];
};
