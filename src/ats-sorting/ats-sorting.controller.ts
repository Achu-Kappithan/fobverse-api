import { Controller, Inject } from '@nestjs/common';
import { ATS_SERVICE, IAtsService } from './interfaces/ats.service.interface';

@Controller('ats-sorting')
export class AtsSortingController {
  constructor(
    @Inject(ATS_SERVICE)
    private readonly _atsService: IAtsService,
  ) {}
}
