import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyProfile, CompanyProfileSchema } from './schema/company.profile.schema';
import { CompanyRepository } from './comapny.repository';
import { COMAPNY_REPOSITORY } from './interface/profile.repository.interface';
import { COMPANY_SERVICE } from './interface/profile.service.interface';

@Module({
  imports:[
        MongooseModule.forFeature([{name:CompanyProfile.name, schema:CompanyProfileSchema}])
  ],
  controllers: [CompanyController],
  providers: [
    {
        provide: COMAPNY_REPOSITORY,
        useClass: CompanyRepository
    },
    {
        provide: COMPANY_SERVICE,
        useClass: CompanyService
    }
  ],
  exports:[COMAPNY_REPOSITORY,COMPANY_SERVICE]
})
export class CompanyModule {}
