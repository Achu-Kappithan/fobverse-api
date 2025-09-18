import { Injectable } from '@nestjs/common';
import { IApplicationRepository } from '../interfaces/application.repository.interface';
import { BaseRepository } from '../../shared/repositories/base.repository';
import {
  ApplicationDocument,
  Applications,
} from '../schema/applications.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  Types,
  UpdateResult,
} from 'mongoose';
import { populatedapplicationList } from '../types/repository.types';

@Injectable()
export class ApplicationRepository
  extends BaseRepository<ApplicationDocument>
  implements IApplicationRepository
{
  constructor(
    @InjectModel(Applications.name)
    private readonly applicationModal: Model<ApplicationDocument>,
  ) {
    super(applicationModal);
  }

  async populatedApplicationList(
    filter: FilterQuery<ApplicationDocument> = {},
    options?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, -1 | 1>;
      projection?: any;
    },
  ): Promise<{ data: populatedapplicationList[]; total: number }> {
    const pipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'candidateprofiles',
          localField: 'candidateId',
          foreignField: 'UserId',
          as: 'profile',
        },
      },
    ];

    pipeline.push({ $sort: options?.sort || { createdAt: -1 } });

    if (options?.skip !== undefined) pipeline.push({ $skip: options.skip });
    if (options?.limit !== undefined) pipeline.push({ $limit: options.limit });

    const [details, total] = await Promise.all([
      this.applicationModal.aggregate(pipeline).exec(),
      this.applicationModal.countDocuments(filter).exec(),
    ]);

    const data = details as populatedapplicationList[];
    return { data, total };
  }

  async updateAtsScore(ids: string[], minScore: number): Promise<UpdateResult> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));

    return this.applicationModal.updateMany(
      { companyId: objectIds[0], jobId: objectIds[1] },
      [
        {
          $set: {
            atsCriteria: minScore,
            Stages: {
              $cond: [
                { $gte: ['$atsScore', minScore] },
                'Shortlisted',
                'default',
              ],
            },
            Rejected: {
              $cond: [{ $gte: ['$atsScore', minScore] }, false, true],
            },
          },
        },
      ],
    );
  }
}
