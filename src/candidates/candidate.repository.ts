import { Injectable } from "@nestjs/common";
import { User, UserDocument } from "./schema/candidate.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/shared/repositories/base.repository";
import { ICandidateRepository } from "./interfaces/candidate-repository.interface";


@Injectable()
export class CandidateRepository extends BaseRepository<UserDocument> implements ICandidateRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
        super(userModel)
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.findOne({email})
    }

    async updateVerificationStatus(userId: string, status: boolean): Promise<UserDocument | null> {
        return this.update({_id:userId},{isVerified:status})
    }

    async UpdateGoogleId(id:string,gooleid:string):Promise<UserDocument | null >{
        return  this.userModel.findByIdAndUpdate(id,{googleId: gooleid},{new:true}) 
    }

}