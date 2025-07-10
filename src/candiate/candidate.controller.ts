import { Controller, Inject } from '@nestjs/common';
import { CANDIDATE_SERVICE, ICandidateService } from './interfaces/candidate-service.interface';

@Controller('candiate')
export class CandiateController {
  constructor(
    @Inject(CANDIDATE_SERVICE)
    private readonly _candiateService:ICandidateService
  ) {}

  
}
