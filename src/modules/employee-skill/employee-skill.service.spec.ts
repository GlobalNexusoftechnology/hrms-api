import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeSkillService } from './employee-skill.service';

describe('EmployeeSkillService', () => {
  let service: EmployeeSkillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeSkillService],
    }).compile();

    service = module.get<EmployeeSkillService>(EmployeeSkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
