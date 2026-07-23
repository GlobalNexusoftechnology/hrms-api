import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeFamilyController } from './employee-family.controller';

describe('EmployeeFamilyController', () => {
  let controller: EmployeeFamilyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeFamilyController],
    }).compile();

    controller = module.get<EmployeeFamilyController>(EmployeeFamilyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
