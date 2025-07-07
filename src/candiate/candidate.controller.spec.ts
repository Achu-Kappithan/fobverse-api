import { Test, TestingModule } from '@nestjs/testing';
import { CandiateController } from './candiate.controller';
import { CandiateService } from './candiate.service';

describe('CandiateController', () => {
  let controller: CandiateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandiateController],
      providers: [CandiateService],
    }).compile();

    controller = module.get<CandiateController>(CandiateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
