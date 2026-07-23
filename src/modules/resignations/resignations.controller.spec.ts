import { Test, TestingModule } from '@nestjs/testing';
import { ResignationsController } from './resignations.controller';

describe('ResignationsController', () => {
  let controller: ResignationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResignationsController],
    }).compile();

    controller = module.get<ResignationsController>(ResignationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
