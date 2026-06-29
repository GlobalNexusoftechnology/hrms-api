import { Test, TestingModule } from '@nestjs/testing';
import { HolidayController } from './holiday.controller';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HolidayTypeEnum } from '../../common/enums/HolidayTypeEnum.enum';

describe('HolidayController', () => {
  let controller: HolidayController;
  let service: HolidayService;

  const mockHoliday = {
    id: 'hol-123',
    name: 'New Year',
    date: '2026-01-01',
    type: HolidayTypeEnum.NATIONAL,
    isPaid: true,
  };

  const mockHolidayService = {
    create: jest.fn().mockResolvedValue(mockHoliday),
    findAll: jest.fn().mockResolvedValue([mockHoliday]),
    findOne: jest.fn().mockResolvedValue(mockHoliday),
    update: jest.fn().mockResolvedValue(mockHoliday),
    remove: jest
      .fn()
      .mockResolvedValue({ message: 'Holiday deleted successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolidayController],
      providers: [
        {
          provide: HolidayService,
          useValue: mockHolidayService,
        },
      ],
    }).compile();

    controller = module.get<HolidayController>(HolidayController);
    service = module.get<HolidayService>(HolidayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return holiday', async () => {
      const dto: CreateHolidayDto = {
        name: 'New Year',
        date: '2026-01-01',
        type: HolidayTypeEnum.NATIONAL,
        isPaid: true,
      };
      const result = await controller.create(dto);
      expect(result).toEqual(mockHoliday);
      expect(mockHolidayService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return lists', async () => {
      const result = await controller.findAll({ month: 1, year: 2026 });
      expect(result).toEqual([mockHoliday]);
      expect(mockHolidayService.findAll).toHaveBeenCalledWith({
        month: 1,
        year: 2026,
      });
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return holiday', async () => {
      const result = await controller.findOne('hol-123');
      expect(result).toEqual(mockHoliday);
      expect(mockHolidayService.findOne).toHaveBeenCalledWith('hol-123');
    });
  });

  describe('update', () => {
    it('should call service.update and return updated holiday', async () => {
      const dto: UpdateHolidayDto = { name: 'Updated Year' };
      const result = await controller.update('hol-123', dto);
      expect(result).toEqual(mockHoliday);
      expect(mockHolidayService.update).toHaveBeenCalledWith('hol-123', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return success message', async () => {
      const result = await controller.remove('hol-123');
      expect(result).toEqual({ message: 'Holiday deleted successfully' });
      expect(mockHolidayService.remove).toHaveBeenCalledWith('hol-123');
    });
  });
});
