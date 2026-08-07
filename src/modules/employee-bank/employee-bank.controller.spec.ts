import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeBankController } from './employee-bank.controller';

describe('EmployeeBankController', () => {
  let controller: EmployeeBankController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeBankController],
    }).compile();

    controller = module.get<EmployeeBankController>(EmployeeBankController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
