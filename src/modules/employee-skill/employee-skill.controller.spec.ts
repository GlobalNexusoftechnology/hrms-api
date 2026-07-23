import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeSkillController } from './employee-skill.controller';

describe('EmployeeSkillController', () => {
  let controller: EmployeeSkillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeSkillController],
    }).compile();

    controller = module.get<EmployeeSkillController>(EmployeeSkillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
