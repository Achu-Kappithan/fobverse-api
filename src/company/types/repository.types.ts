import { JobsDocument } from '../../jobs/schema/jobs.schema';
import { CompanyProfileDocument } from '../schema/company.profile.schema';

export type populatedComapnyProfile = CompanyProfileDocument & {
  jobs: JobsDocument[];
};
