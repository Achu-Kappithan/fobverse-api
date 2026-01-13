import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IAuthRepository } from './interfaces/IAuthRepository';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './schema/user.schema';
import { BaseRepository } from '../shared/repositories/base.repository';
import {
  PopulatedCompany,
  populatedpData,
} from './interfaces/api-response.interface';

@Injectable()
export class AuthRepository
  extends BaseRepository<UserDocument>
  implements IAuthRepository
{
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }

  async findCandidateByEmail(email: string): Promise<populatedpData> {
    const result = await this.userModel.aggregate([
      {
        $match: { email: email },
      },
      {
        $lookup: {
          from: 'candidateprofiles',
          localField: '_id',
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
    return result[0] as populatedpData;
  }

  async findCompanyByEmail(email: string): Promise<PopulatedCompany> {
    const result = await this.userModel.aggregate([
      {
        $match: { email: email },
      },
      {
        $lookup: {
          from: 'companyprofiles',
          localField: 'companyId',
          foreignField: '_id',
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
    return result[0] as PopulatedCompany;
  }

  async updateVerificationStatus(
    adminUserId: string,
    status: boolean,
  ): Promise<UserDocument | null> {
    return this.update({ _id: adminUserId }, { isVerified: status });
  }

  async UpdateGoogleId(
    id: string,
    gooleid: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { googleId: gooleid },
      { new: true },
    );
  }

  async findUserbyEmailAndRole(
    emai: string,
    role: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: emai, role: role });
  }

  async findInternalUsers(companyId: Types.ObjectId): Promise<UserDocument[]> {
    return this.userModel.find({
      companyId: companyId,
      role: { $ne: UserRole.COMPANY_ADMIN },
    });
  }

  async findHrUsers(companyId: Types.ObjectId): Promise<UserDocument[]> {
    return this.userModel.find({
      companyId: companyId,
      role: { $eq: UserRole.HR_USER },
    });
  }

  async findInterviewers(companyId: Types.ObjectId): Promise<UserDocument[]> {
    return this.userModel.find({
      companyId: companyId,
      role: { $eq: UserRole.INTERVIEWER_USER },
    });
  }
}
