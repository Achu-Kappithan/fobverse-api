import { Test, TestingModule } from '@nestjs/testing';
import { AtsSortingService } from './ats-sorting.service';

describe('AtsSortingService', () => {
  let service: AtsSortingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtsSortingService],
    }).compile();

    service = module.get<AtsSortingService>(AtsSortingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
