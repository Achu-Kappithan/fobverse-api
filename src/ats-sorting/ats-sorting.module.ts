import { Module } from '@nestjs/common';
import { AtsSortingService } from './ats-sorting.service';
import { AtsSortingController } from './ats-sorting.controller';
import { ATS_SERVICE } from './interfaces/ats.service.interface';
import { AtsWorkerPoolService } from './ats-worker-pool.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Applications,
  ApplicationSchema,
} from '../applications/schema/applications.schema';
import { APPLICATION_REPOSITORY } from '../applications/interfaces/application.repository.interface';
import { ApplicationRepository } from '../applications/repository/applications.repository';

@Module({
  imports: [
    // ApplicationRepository requires the Mongoose model to be registered here
    MongooseModule.forFeature([
      { name: Applications.name, schema: ApplicationSchema },
    ]),
  ],
  controllers: [AtsSortingController],
  providers: [
    {
      provide: ATS_SERVICE,
      useClass: AtsSortingService,
    },
    // Repository — needed by AtsWorkerPoolService to persist scoring results
    {
      provide: APPLICATION_REPOSITORY,
      useClass: ApplicationRepository,
    },
    AtsWorkerPoolService,
  ],
  exports: [ATS_SERVICE, AtsWorkerPoolService],
})
export class AtsSortingModule {}
