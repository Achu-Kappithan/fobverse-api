import { CompanyProfileDocument } from '../../company/schema/company.profile.schema';
import { JobsDocument } from '../schema/jobs.schema';

export type populatedJobDetails = JobsDocument & {
  profile: CompanyProfileDocument[];
};
