import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: DepartmentsService;

  const mockDepartment = {
    id: 'dept-123',
    name: 'Human Resources',
    code: 'HR',
    isActive: true,
  };

  const mockDepartmentsService = {
    create: jest.fn().mockResolvedValue(mockDepartment),
    findAll: jest.fn().mockResolvedValue({ data: [mockDepartment], meta: {} }),
    findOne: jest.fn().mockResolvedValue(mockDepartment),
    update: jest.fn().mockResolvedValue(mockDepartment),
    remove: jest
      .fn()
      .mockResolvedValue({ message: 'Department deleted successfully' }),
    restore: jest
      .fn()
      .mockResolvedValue({ message: 'Department restored successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: mockDepartmentsService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return department', async () => {
      const dto: CreateDepartmentDto = { name: 'HR', code: 'HR' };
      const result = await controller.create(dto);
      expect(result).toEqual(mockDepartment);
      expect(mockDepartmentsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return paginated list', async () => {
      const result = await controller.findAll('1', '10', 'search');
      expect(result.data).toEqual([mockDepartment]);
      expect(mockDepartmentsService.findAll).toHaveBeenCalledWith(
        1,
        10,
        'search',
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return department', async () => {
      const result = await controller.findOne('dept-123');
      expect(result).toEqual(mockDepartment);
      expect(mockDepartmentsService.findOne).toHaveBeenCalledWith('dept-123');
    });
  });

  describe('update', () => {
    it('should call service.update and return updated department', async () => {
      const dto: UpdateDepartmentDto = { name: 'HR Dept' };
      const result = await controller.update('dept-123', dto);
      expect(result).toEqual(mockDepartment);
      expect(mockDepartmentsService.update).toHaveBeenCalledWith(
        'dept-123',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove and return success message', async () => {
      const result = await controller.remove('dept-123');
      expect(result).toEqual({ message: 'Department deleted successfully' });
      expect(mockDepartmentsService.remove).toHaveBeenCalledWith('dept-123');
    });
  });

  describe('restore', () => {
    it('should call service.restore and return success message', async () => {
      const result = await controller.restore('dept-123');
      expect(result).toEqual({ message: 'Department restored successfully' });
      expect(mockDepartmentsService.restore).toHaveBeenCalledWith('dept-123');
    });
  });
});
