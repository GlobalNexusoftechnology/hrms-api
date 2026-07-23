import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeAddressController } from './employee-address.controller';

describe('EmployeeAddressController', () => {
  let controller: EmployeeAddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeAddressController],
    }).compile();

    controller = module.get<EmployeeAddressController>(EmployeeAddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
