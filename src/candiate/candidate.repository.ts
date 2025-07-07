import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/shared/repositories/base.repository';
import { ICandidateRepository } from './interfaces/candidate-repository.interface';
import { CandidateProfile, CandidateProfileDocument } from './schema/candidate.profile.schema';

@Injectable()
//  implements ICandidateRepository
export class CandidateRepository extends BaseRepository<CandidateProfileDocument> implements ICandidateRepository {
  constructor(
    @InjectModel(CandidateProfile.name) private readonly candiateModel: Model<CandidateProfileDocument>,
  ) {
    super(candiateModel);
  }

  async findByEmail(email: string): Promise<CandidateProfileDocument | null> {
      return this.candiateModel.findOne({email})
  }

}
