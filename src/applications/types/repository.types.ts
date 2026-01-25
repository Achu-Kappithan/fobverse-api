import { CandidateProfileDocument } from '../../candiate/schema/candidate.profile.schema';
import { ApplicationDocument } from '../schema/applications.schema';
import { JobsDocument } from '../../jobs/schema/jobs.schema';
import { CompanyProfileDocument } from '../../company/schema/company.profile.schema';
import { Types } from 'mongoose';

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

export type PopulatedCandidateApplication = ApplicationDocument & {
  jobDetails?: JobsDocument;
  companyDetails?: CompanyProfileDocument;
};

export interface CandidateApplicationAggregation {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  companyId: Types.ObjectId;
  candidateId: Types.ObjectId;
  applicationStatus: boolean;
  Stages: string;
  Rejected: boolean;
  createdAt: Date;
  updatedAt: Date;
  atsScore: number;
  resumeUrl: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  jobDetails?: {
    _id: Types.ObjectId;
    title: string;
    location: string[];
    jobType: string;
    [key: string]: any;
  };
  companyDetails?: {
    _id: Types.ObjectId;
    name: string;
    logoUrl?: string;
    [key: string]: any;
  };
}
