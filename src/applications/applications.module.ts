import { Module, forwardRef } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Applications, ApplicationSchema } from './schema/applications.schema';
import { APPLICATION_REPOSITORY } from './interfaces/application.repository.interface';
import { ApplicationRepository } from './repository/applications.repository';
import { APPLICATION_SERVICE } from './interfaces/application.service.interface';
import { ApplicationsService } from './applications.service';
import { CandiateModule } from '../candiate/candidate.module';
import { JobsModule } from '../jobs/jobs.module';
import { EmailModule } from '../email/email.module';
import { AtsSortingModule } from '../ats-sorting/ats-sorting.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Applications.name, schema: ApplicationSchema },
    ]),
    forwardRef(() => CandiateModule),
    JobsModule,
    EmailModule,
    AtsSortingModule,
  ],
  controllers: [ApplicationsController],
  providers: [
    {
      provide: APPLICATION_REPOSITORY,
      useClass: ApplicationRepository,
    },
    {
      provide: APPLICATION_SERVICE,
      useClass: ApplicationsService,
    },
  ],
  exports: [APPLICATION_SERVICE],
})
export class ApplicationsModule {}
