import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ADMIN_SERVICE } from './interfaces/IAdminService';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports:[
    CompanyModule
  ],
  controllers: [AdminController],
  providers: [
    {
      provide:ADMIN_SERVICE,
      useClass: AdminService
    }
  ],
  exports:[ADMIN_SERVICE]
})
export class AdminModule {}
