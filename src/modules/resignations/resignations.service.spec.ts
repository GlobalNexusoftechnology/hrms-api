import { Test, TestingModule } from '@nestjs/testing';
import { ResignationsService } from './resignations.service';

describe('ResignationsService', () => {
  let service: ResignationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResignationsService],
    }).compile();

    service = module.get<ResignationsService>(ResignationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
