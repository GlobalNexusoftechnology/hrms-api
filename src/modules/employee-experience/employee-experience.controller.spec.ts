import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeExperienceController } from './employee-experience.controller';

describe('EmployeeExperienceController', () => {
  let controller: EmployeeExperienceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeExperienceController],
    }).compile();

    controller = module.get<EmployeeExperienceController>(EmployeeExperienceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
