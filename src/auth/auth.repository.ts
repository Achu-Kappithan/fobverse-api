import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'src/shared/repositories/base.repository';
import { User, UserDocument } from './schema/candidate.schema';
import { IAuthRepository } from './interfaces/IAuthRepository';
import { Model } from 'mongoose';

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

  async findCandidateByEmail(email: string): Promise<any> {
    return this.userModel.aggregate([
        {
          $match: { email: email } 
        },
        {
          $lookup: {
            from: 'candidateprofiles',
            localField: '_id',
            foreignField: 'userId',
            as: 'profile'
          }
        },
        {
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true
        }
      }
    ])
  }

  async findCompanyByEmail(email: string): Promise<any> {
        return this.userModel.aggregate([
        {
          $match: { email: email } 
        },
        {
          $lookup: {
            from: 'companyprofiles',
            localField: '_id',
            foreignField: 'userId',
            as: 'profile'
          }
        },
        {
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true
        }
      }
    ])
  }

  async updateVerificationStatus(
    userId: string,
    status: boolean,
  ): Promise<UserDocument | null> {
    return this.update({ _id: userId }, { isVerified: status });
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
}
