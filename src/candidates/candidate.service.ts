import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICandidateService } from "./interfaces/candidate-service.interface";
import { CANDIDATE_REPOSITORY, ICandidateRepository } from "./interfaces/candidate-repository.interface";
import { UserDocument } from "./schema/candidate.schema";
import * as bcrypt from 'bcrypt'


@Injectable()
export class CandidateService implements ICandidateService {
    private readonly logger = new Logger(CandidateService.name)

    constructor (
        @Inject(CANDIDATE_REPOSITORY)
        private readonly candidateRepository: ICandidateRepository
    ) {}

    async findByEmail(email: string): Promise<UserDocument | null> {
        this.logger.debug(`Finding user by email: ${email}`)
        return this.candidateRepository.findByEmail(email)
    }

    async findById(id: string): Promise<UserDocument | null> {
        this.logger.debug(`Finding user by Id:${id}`)
        return this.candidateRepository.findById(id)
    }

    async createCandidate(name: string, email: string, password: string): Promise<UserDocument | null> {
        const hashPassword = await bcrypt.hash(password,10)
        const newUser = {
            name,
            email,
            password:hashPassword
        }
        this.logger.log(`Creating new candidate: ${email}`)
        return this.candidateRepository.create(newUser)
    }

    async updateVerificationStatus(userId: string, status: boolean): Promise<UserDocument | null> {
        this.logger.log(`Updating verification status for user ${userId} to ${status}`)
        return this.candidateRepository.updateVerificationStatus(userId,status)
    }



}