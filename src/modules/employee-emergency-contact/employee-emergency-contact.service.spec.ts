import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeEmergencyContactService } from './employee-emergency-contact.service';

describe('EmployeeEmergencyContactService', () => {
  let service: EmployeeEmergencyContactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeEmergencyContactService],
    }).compile();

    service = module.get<EmployeeEmergencyContactService>(EmployeeEmergencyContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
