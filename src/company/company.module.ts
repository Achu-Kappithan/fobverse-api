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
import { AuthModule } from 'src/auth/auth.module';
import { CompanyRepository } from './repository/comapny.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyProfile.name, schema: CompanyProfileSchema },
    ]),
    forwardRef(() => AuthModule),
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
