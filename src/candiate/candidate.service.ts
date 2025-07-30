import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ICandidateService } from './interfaces/candidate-service.interface';
import {
  CANDIDATE_REPOSITORY,
  ICandidateRepository,
} from './interfaces/candidate-repository.interface';
import { CreateCandidateProfileDto } from './dtos/create-candidate-profile.dto';
import { CandidateProfileDocument } from './schema/candidate.profile.schema';
import { MESSAGES } from 'src/shared/constants/constants.messages';
import { CreateProfileDto } from 'src/company/dtos/create.profile.dto';
import { Types } from 'mongoose';
import { CandidateResponceInterface } from './interfaces/responce.interface';
import { CandidateProfileResponseDto } from './dtos/candidate-responce.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CandidateService implements ICandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    @Inject(CANDIDATE_REPOSITORY)
    private readonly _candidateRepository: ICandidateRepository,
  ) {}

  // find User ByEmail
  async findByEmail(email: string): Promise<CandidateProfileDocument | null> {
      this.logger.debug(`Finding user by email: ${email}`)
      return this._candidateRepository.findByEmail(email)
  }

  // find Candidate ById
  async findById(id: string): Promise<CandidateProfileDocument | null> {
      this.logger.debug(`Finding user by Id:${id}`)
      return this._candidateRepository.findById(id)
  }

  // for Creating CanidateProfile
  async createPorfile(dto:CreateCandidateProfileDto):Promise<CandidateProfileDocument>{
    this.logger.debug(`[CandidateService] Creating new candieate profile${dto.name}`)
    const updateDto = {
      name:dto.name,
      adminUserId : new Types.ObjectId(dto.UserId)
    }
    const newprofile = await this._candidateRepository.create(updateDto)
    this.logger.debug(`new profil created ${newprofile}`)

    if(!newprofile){
      throw new InternalServerErrorException(MESSAGES.AUTH.PROFILE_CREATION_FAIILD)
    }
    return newprofile
  }
  
  // for finding All candidate List 
  async findAllCandidate(): Promise<CandidateProfileDocument[] | null> {
    return await this._candidateRepository.findAll()
  }

  async GetProfile(id:string):Promise<CandidateResponceInterface<CandidateProfileResponseDto>>{
    const ProfileData = await this._candidateRepository.findOne({UserId:id})
    const mappedData = plainToInstance(
      CandidateProfileResponseDto,
      {
      ...ProfileData?.toObject()
      },
      {excludeExtraneousValues:true}
    )
    return {
      message:MESSAGES.CANDIDATE.PROFILE_FETCH_SUCCESS,
      data:mappedData
    }
  }


}
