import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CANDIDATE_REPOSITORY } from './interfaces/candidate-repository.interface';
import { CANDIDATE_SERVICE } from './interfaces/candidate-service.interface';
import {
  CandidateProfile,
  CandidateProfileSchema,
} from './schema/candidate.profile.schema';
import { CandidateRepository } from './candidate.repository';
import { CandidateService } from './candidate.service';
import { CandiateController } from './candidate.controller';
import { CompanyModule } from '../company/company.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CandidateProfile.name, schema: CandidateProfileSchema },
    ]),
    CompanyModule,
    forwardRef(() => ApplicationsModule),
  ],
  providers: [
    {
      provide: CANDIDATE_REPOSITORY,
      useClass: CandidateRepository,
    },
    {
      provide: CANDIDATE_SERVICE,
      useClass: CandidateService,
    },
  ],
  exports: [CANDIDATE_SERVICE, CANDIDATE_REPOSITORY],
  controllers: [CandiateController],
})
export class CandiateModule {}
