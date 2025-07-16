import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'src/shared/repositories/base.repository';
import { IAuthRepository } from './interfaces/IAuthRepository';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

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
            foreignField: 'adminUserId',
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
            foreignField: 'adminUserId',
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
}
