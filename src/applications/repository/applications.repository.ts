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
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'candidateUser',
        },
      },
      {
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$candidateUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$jobDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    pipeline.push({ $sort: options?.sort || { createdAt: -1 } });

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          ...(options?.skip !== undefined ? [{ $skip: options.skip }] : []),
          ...(options?.limit !== undefined ? [{ $limit: options.limit }] : []),
        ],
      },
    });

    const [result] = await this.applicationModal.aggregate(pipeline).exec();

    const data = result?.data || [];
    const total = result?.metadata?.[0]?.total || 0;
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

  async getApplicationDetails(
    appId: string,
  ): Promise<populatedapplicationList> {
    const applicaton = await this.applicationModal.aggregate([
      {
        $match: { _id: new Types.ObjectId(appId) },
      },
      {
        $lookup: {
          from: 'candidateprofiles',
          localField: 'candidateId',
          foreignField: 'UserId',
          as: 'profile',
        },
      },
      {
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    return applicaton[0] as populatedapplicationList;
  }
}
