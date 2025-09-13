import { Test, TestingModule } from '@nestjs/testing';
import { ResumeParserServiceService } from './resume-parser.service.service';

describe('ResumeParserServiceService', () => {
  let service: ResumeParserServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResumeParserServiceService],
    }).compile();

    service = module.get<ResumeParserServiceService>(
      ResumeParserServiceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
