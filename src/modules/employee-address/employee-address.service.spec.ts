import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeAddressService } from './employee-address.service';

describe('EmployeeAddressService', () => {
  let service: EmployeeAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeAddressService],
    }).compile();

    service = module.get<EmployeeAddressService>(EmployeeAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
