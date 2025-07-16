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

@Injectable()
export class CandidateService implements ICandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    @Inject(CANDIDATE_REPOSITORY)
    private readonly candidateRepository: ICandidateRepository,
  ) {}

  async findByEmail(email: string): Promise<CandidateProfileDocument | null> {
      this.logger.debug(`Finding user by email: ${email}`)
      return this.candidateRepository.findByEmail(email)
  }

  async findById(id: string): Promise<CandidateProfileDocument | null> {
      this.logger.debug(`Finding user by Id:${id}`)
      return this.candidateRepository.findById(id)
  }

  async createPorfile(dto:CreateCandidateProfileDto):Promise<CandidateProfileDocument>{
    this.logger.debug(`[CandidateService] Creating new candieate profile${dto.name}`)
    const updateDto = {
      name:dto.name,
      adminUserId : new Types.ObjectId(dto.adminUserId)
    }
    const newprofile = await this.candidateRepository.create(updateDto)
    this.logger.debug(`new profil created ${newprofile}`)

    if(!newprofile){
      throw new InternalServerErrorException(MESSAGES.AUTH.PROFILE_CREATION_FAIILD)
    }
    return newprofile
  }

  async findAllCandidate(): Promise<CandidateProfileDocument[] | null> {
    return await this.candidateRepository.findAll()
  }

}
