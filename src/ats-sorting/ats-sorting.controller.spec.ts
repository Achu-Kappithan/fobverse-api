import { Test, TestingModule } from '@nestjs/testing';
import { AtsSortingController } from './ats-sorting.controller';
import { AtsSortingService } from './ats-sorting.service';

describe('AtsSortingController', () => {
  let controller: AtsSortingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtsSortingController],
      providers: [AtsSortingService],
    }).compile();

    controller = module.get<AtsSortingController>(AtsSortingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
