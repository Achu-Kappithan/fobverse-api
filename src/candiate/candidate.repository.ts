import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateResult } from 'mongoose';
import { ICandidateRepository } from './interfaces/candidate-repository.interface';
import {
  CandidateProfile,
  CandidateProfileDocument,
} from './schema/candidate.profile.schema';
import { BaseRepository } from '../shared/repositories/base.repository';

@Injectable()
export class CandidateRepository
  extends BaseRepository<CandidateProfileDocument>
  implements ICandidateRepository
{
  constructor(
    @InjectModel(CandidateProfile.name)
    private readonly candidateModel: Model<CandidateProfileDocument>,
  ) {
    super(candidateModel);
  }

  async findByEmail(email: string): Promise<CandidateProfileDocument | null> {
    return this.candidateModel.findOne({ email });
  }

  async updateStatus(id: string): Promise<UpdateResult> {
    return await this.candidateModel.updateOne({ _id: id }, [
      {
        $set: {
          isActive: { $not: '$isActive' },
        },
      },
    ]);
  }
}
