import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICandidateService } from './interfaces/candidate-service.interface';
import {
  CANDIDATE_REPOSITORY,
  ICandidateRepository,
} from './interfaces/candidate-repository.interface';
import * as bcrypt from 'bcrypt';
import { UserDocument } from 'src/auth/schema/candidate.schema';

@Injectable()
// implements ICandidateService
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    @Inject(CANDIDATE_REPOSITORY)
    private readonly candidateRepository: ICandidateRepository,
  ) {}

  // async findByEmail(email: string): Promise<UserDocument | null> {
  //     this.logger.debug(`Finding user by email: ${email}`)
  //     return this.candidateRepository.findByEmail(email)
  // }

  // async findById(id: string): Promise<UserDocument | null> {
  //     this.logger.debug(`Finding user by Id:${id}`)
  //     return this.candidateRepository.findById(id)
  // }

  // async createCandidate(name: string, email: string, password: string): Promise<UserDocument | null> {
  //     const hashPassword = await bcrypt.hash(password,10)
  //     const newUser = {
  //         name,
  //         email,
  //         password:hashPassword
  //     }
  //     this.logger.log(`Creating new candidate: ${email}`)
  //     return this.candidateRepository.create(newUser)
  // }

  // async updateVerificationStatus(userId: string, status: boolean): Promise<UserDocument | null> {
  //     this.logger.log(`Updating verification status for user ${userId} to ${status}`)
  //     return this.candidateRepository.updateVerificationStatus(userId,status)
  // }

  // async createGoogleUser(name: string, email: string , googleId: string,isVerified:boolean): Promise<UserDocument | null> {
  //      const newUser = {
  //         name,
  //         email,
  //         googleId,
  //         isVerified
  //     }
  //     return this.candidateRepository.create(newUser)
  // }

  // async linkGoogleAccount(id: string, googleId: string): Promise<UserDocument | null> {
  //     return  this.candidateRepository.UpdateGoogleId(id,googleId)
  // }
}
