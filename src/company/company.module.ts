import { forwardRef, Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CompanyProfile,
  CompanyProfileSchema,
} from './schema/company.profile.schema';
import { COMAPNY_REPOSITORY } from './interface/profile.repository.interface';
import { COMPANY_SERVICE } from './interface/profile.service.interface';
import { CompanyRepository } from './repository/comapny.repository';
import { AuthModule } from '../auth/auth.module';
import { JobsModule } from '../jobs/jobs.module';
import { ApplicationsModule } from '../applications/applications.module';
import { InterviewModule } from '../interview/interview.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
    ]),
    forwardRef(() => AuthModule),
    JobsModule,
    ApplicationsModule,
    InterviewModule,
  ],
  controllers: [CompanyController],
  providers: [
    {
      provide: COMAPNY_REPOSITORY,
      useClass: CompanyRepository,
    },
    {
      provide: COMPANY_SERVICE,
      useClass: CompanyService,
    },
  ],
  exports: [COMAPNY_REPOSITORY, COMPANY_SERVICE],
})
export class CompanyModule {}
