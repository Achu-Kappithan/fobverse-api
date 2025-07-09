import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateResult } from 'mongoose';
import { BaseRepository } from 'src/shared/repositories/base.repository';
import { ICandidateRepository } from './interfaces/candidate-repository.interface';
import { CandidateProfile, CandidateProfileDocument } from './schema/candidate.profile.schema';

@Injectable()
export class CandidateRepository extends BaseRepository<CandidateProfileDocument> implements ICandidateRepository {
  constructor(
    @InjectModel(CandidateProfile.name) private readonly candiateModel: Model<CandidateProfileDocument>,
  ) {
    super(candiateModel);
  }

  async findByEmail(email: string): Promise<CandidateProfileDocument | null> {
      return this.candiateModel.findOne({email})
  }

  async updateStatus(id: string): Promise<UpdateResult> {
    return await this.candiateModel.updateOne({ _id: id }, [
      {
        $set: {
          isActive: { $not: '$isActive' },
        },
      },
    ]);
  }

}
