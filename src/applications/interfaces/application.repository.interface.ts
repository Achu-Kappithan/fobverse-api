import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { ApplicationDocument } from '../schema/applications.schema';
export interface IApplicationRepository
  extends IBaseRepository<ApplicationDocument> {}
export const APPLICATION_REPOSITORY = 'APPLICATION_REPOSITORY';
