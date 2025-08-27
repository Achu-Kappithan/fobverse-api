import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Applications, ApplicationSchema } from './schema/applications.schema';
import { APPLICATION_REPOSITORY } from './interfaces/application.repository.interface';
import { ApplicationRepository } from './repository/applications.repository';
import { APPLICATION_SERVICE } from './interfaces/application.service.interface';
import { ApplicationsService } from './applications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Applications.name, schema: ApplicationSchema },
    ]),
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
})
export class ApplicationsModule {}
