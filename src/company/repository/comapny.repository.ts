import { Injectable } from '@nestjs/common';
import {
  CompanyProfile,
  CompanyProfileDocument,
} from '../schema/company.profile.schema';
import { IcompanyRepository } from '../interface/profile.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateResult } from 'mongoose';
import { InternalUserDto, TeamMemberDto } from '../dtos/update.profile.dtos';
import { BaseRepository } from '../../shared/repositories/base.repository';
import { populatedComapnyProfile } from '../types/repository.types';

@Injectable()
export class CompanyRepository
  extends BaseRepository<CompanyProfileDocument>
  implements IcompanyRepository
{
  constructor(
    @InjectModel(CompanyProfile.name)
    private readonly profileModel: Model<CompanyProfileDocument>,
  ) {
    super(profileModel);
  }

  async updateStatus(id: string): Promise<UpdateResult> {
    return await this.profileModel.updateOne({ _id: id }, [
      {
        $set: {
          isActive: { $not: '$isActive' },
        },
      },
    ]);
  }

  async addInternalUser(
    id: string,
    dto: InternalUserDto,
  ): Promise<CompanyProfileDocument | null> {
    return await this.profileModel.findOneAndUpdate(
      { userId: id },
      { $addToSet: { internalUsers: dto } },
      { new: true },
    );
  }

  async addTeamMembers(
    id: string,
    dto: TeamMemberDto,
  ): Promise<CompanyProfileDocument | null> {
    return this.profileModel.findByIdAndUpdate(
      id,
      { $push: { teamMembers: dto } },
      { new: true },
    );
  }

  async publicPorfile(id: string): Promise<populatedComapnyProfile> {
    const objid = new Types.ObjectId(id);
    const data = await this.profileModel.aggregate([
      { $match: { _id: objid } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'companyId',
          as: 'jobs',
        },
      },
    ]);
    return data[0] as populatedComapnyProfile;
  }
}
