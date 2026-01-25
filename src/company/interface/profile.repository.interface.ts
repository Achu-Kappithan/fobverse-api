import { CompanyProfileDocument } from '../schema/company.profile.schema';
import { FilterQuery, UpdateResult } from 'mongoose';
import { InternalUserDto, TeamMemberDto } from '../dtos/update.profile.dtos';
import { IBaseRepository } from '../../shared/interface/base-repository.interface';
import { populatedComapnyProfile } from '../types/repository.types';

export interface IcompanyRepository
  extends IBaseRepository<CompanyProfileDocument> {
  updateStatus(id: string): Promise<UpdateResult>;

  addInternalUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<CompanyProfileDocument | null>;

  addTeamMembers(
    id: string,
    dto: TeamMemberDto,
  ): Promise<CompanyProfileDocument | null>;

  publicPorfile(id: string): Promise<populatedComapnyProfile>;
}

export const COMAPNY_REPOSITORY = 'COMAPNY_REPOSITORY';
