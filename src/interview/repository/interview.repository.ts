import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../shared/repositories/base.repository';
import { Interview, InterviewDocument } from '../schema/interview.schema';
import { IInterviewRepository } from '../interfaces/interview.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class InterviewRepository
  extends BaseRepository<InterviewDocument>
  implements IInterviewRepository
{
  constructor(
    @InjectModel(Interview.name)
    private readonly InterviewModel: Model<InterviewDocument>,
  ) {
    super(InterviewModel);
  }

  async getStageDetails(
    appId: string,
    stage: string,
  ): Promise<InterviewDocument | null> {
    const applicationId = new Types.ObjectId(appId);
    return this.InterviewModel.findOne({
      applicationId,
      stage,
    });
  }

  async findAllByApplicationId(appId: string): Promise<InterviewDocument[]> {
    const applicationId = new Types.ObjectId(appId);
    return this.InterviewModel.find({
      applicationId,
    });
  }

  async updateFeedback(
    appId: string,
    stage: string,
    data: { overallFeedback: string; finalResult: string },
  ): Promise<InterviewDocument | null> {
    const applicationId = new Types.ObjectId(appId);

    return this.InterviewModel.findOneAndUpdate(
      { applicationId, stage },
      { $set: data },
      { new: true },
    );
  }
}
