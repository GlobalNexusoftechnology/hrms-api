import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeEducationController } from './employee-education.controller';

describe('EmployeeEducationController', () => {
  let controller: EmployeeEducationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeEducationController],
    }).compile();

    controller = module.get<EmployeeEducationController>(EmployeeEducationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
