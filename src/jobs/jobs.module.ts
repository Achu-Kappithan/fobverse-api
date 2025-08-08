import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JOBS_SERVICE } from './interfaces/jobs.service.interface';
import { JobsService } from './jobs.service';
import { JOBS_REPOSITORY } from './interfaces/jobs.repository.interface';
import { JobRepository } from './repository/jobs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Jobs, JobSchema} from './schema/jobs.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:Jobs.name, schema:JobSchema}
    ])
  ],
  controllers: [JobsController],
  providers: [
    {
      provide: JOBS_SERVICE,
      useClass:JobsService
    },
    {
      provide: JOBS_REPOSITORY,
      useClass: JobRepository
    }
  ],
  exports:[JOBS_SERVICE,JOBS_REPOSITORY]
})
export class JobsModule {}
