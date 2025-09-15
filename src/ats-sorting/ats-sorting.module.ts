import { Module } from '@nestjs/common';
import { AtsSortingService } from './ats-sorting.service';
import { AtsSortingController } from './ats-sorting.controller';
import { ATS_SERVICE } from './interfaces/ats.service.interface';

@Module({
  controllers: [AtsSortingController],
  providers: [
    {
      provide: ATS_SERVICE,
      useClass: AtsSortingService,
    },
  ],
  exports: [ATS_SERVICE],
})
export class AtsSortingModule {}
