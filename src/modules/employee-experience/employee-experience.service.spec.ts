import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeExperienceService } from './employee-experience.service';

describe('EmployeeExperienceService', () => {
  let service: EmployeeExperienceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeExperienceService],
    }).compile();

    service = module.get<EmployeeExperienceService>(EmployeeExperienceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
