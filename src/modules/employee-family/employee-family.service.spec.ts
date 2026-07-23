import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeFamilyService } from './employee-family.service';

describe('EmployeeFamilyService', () => {
  let service: EmployeeFamilyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeFamilyService],
    }).compile();

    service = module.get<EmployeeFamilyService>(EmployeeFamilyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
