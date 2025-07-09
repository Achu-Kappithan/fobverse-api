import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/shared/repositories/base.repository';
import {
  CompanyProfile,
  CompanyProfileDocument,
} from './schema/company.profile.schema';
import { IcompanyRepository } from './interface/profile.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateResult } from 'mongoose';

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
}
