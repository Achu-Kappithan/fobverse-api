import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ADMIN_SERVICE } from './interfaces/IAdminService';
import { CompanyModule } from '../company/company.module';
import { CandiateModule } from '../candiate/candidate.module';
import { JobsModule } from '../jobs/jobs.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CompanyModule, CandiateModule, JobsModule, AuthModule],
  controllers: [AdminController],
  providers: [
    {
      provide: ADMIN_SERVICE,
      useClass: AdminService,
    },
  ],
  exports: [ADMIN_SERVICE],
})
export class AdminModule {}
