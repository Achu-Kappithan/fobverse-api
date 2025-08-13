import { Test, TestingModule } from '@nestjs/testing';
import { CandiateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

describe('CandiateController', () => {
  let controller: CandiateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandiateController],
      providers: [CandidateService],
    }).compile();

    controller = module.get<CandiateController>(CandiateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
