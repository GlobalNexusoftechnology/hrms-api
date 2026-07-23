import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeBankService } from './employee-bank.service';

describe('EmployeeBankService', () => {
  let service: EmployeeBankService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeBankService],
    }).compile();

    service = module.get<EmployeeBankService>(EmployeeBankService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
