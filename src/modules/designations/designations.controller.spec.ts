import { Test, TestingModule } from '@nestjs/testing';
import { DesignationsController } from './designations.controller';
import { DesignationsService } from './designations.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';

describe('DesignationsController', () => {
  let controller: DesignationsController;
  let service: DesignationsService;

  const mockDesignation = {
    id: 'desg-123',
    name: 'Software Engineer',
    code: 'SE',
    departmentId: 'dept-123',
    isActive: true,
  };

  const mockDesignationsService = {
    create: jest.fn().mockResolvedValue(mockDesignation),
    findAll: jest.fn().mockResolvedValue({ data: [mockDesignation], meta: {} }),
    findOne: jest.fn().mockResolvedValue(mockDesignation),
    update: jest.fn().mockResolvedValue(mockDesignation),
    remove: jest
      .fn()
      .mockResolvedValue({ message: 'Designation deleted successfully' }),
    restore: jest
      .fn()
      .mockResolvedValue({ message: 'Designation restored successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DesignationsController],
      providers: [
        {
          provide: DesignationsService,
          useValue: mockDesignationsService,
        },
      ],
    }).compile();

    controller = module.get<DesignationsController>(DesignationsController);
    service = module.get<DesignationsService>(DesignationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return designation', async () => {
      const dto: CreateDesignationDto = {
        name: 'SE',
        code: 'SE',
        departmentId: 'dept-123',
      };
      const result = await controller.create(dto);
      expect(result).toEqual(mockDesignation);
      expect(mockDesignationsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return paginated list', async () => {
      const result = await controller.findAll('1', '10', 'search', 'dept-123');
      expect(result.data).toEqual([mockDesignation]);
      expect(mockDesignationsService.findAll).toHaveBeenCalledWith(
        1,
        10,
        'search',
        'dept-123',
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return designation', async () => {
      const result = await controller.findOne('desg-123');
      expect(result).toEqual(mockDesignation);
      expect(mockDesignationsService.findOne).toHaveBeenCalledWith('desg-123');
    });
  });

  describe('update', () => {
    it('should call service.update and return updated designation', async () => {
      const dto: UpdateDesignationDto = { name: 'Senior SE' };
      const result = await controller.update('desg-123', dto);
      expect(result).toEqual(mockDesignation);
      expect(mockDesignationsService.update).toHaveBeenCalledWith(
        'desg-123',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove and return success message', async () => {
      const result = await controller.remove('desg-123');
      expect(result).toEqual({ message: 'Designation deleted successfully' });
      expect(mockDesignationsService.remove).toHaveBeenCalledWith('desg-123');
    });
  });

  describe('restore', () => {
    it('should call service.restore and return success message', async () => {
      const result = await controller.restore('desg-123');
      expect(result).toEqual({ message: 'Designation restored successfully' });
      expect(mockDesignationsService.restore).toHaveBeenCalledWith('desg-123');
    });
  });
});
