import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeEducationService } from './employee-education.service';

describe('EmployeeEducationService', () => {
  let service: EmployeeEducationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeEducationService],
    }).compile();

    service = module.get<EmployeeEducationService>(EmployeeEducationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
