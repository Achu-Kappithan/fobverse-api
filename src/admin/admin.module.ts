import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ADMIN_SERVICE } from './interfaces/IAdminService';
import { CompanyModule } from 'src/company/company.module';
import { CandiateModule } from 'src/candiate/candidate.module';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  imports:[
    CompanyModule,
    CandiateModule,
    JobsModule
  ],
  controllers: [AdminController],
  providers: [
    {
      provide:ADMIN_SERVICE,
      useClass: AdminService
    },

  ],
  exports:[ADMIN_SERVICE]
})
export class AdminModule {}
