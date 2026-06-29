import { Test, TestingModule } from '@nestjs/testing';
import { WeekendSettingsController } from './weekend_settings.controller';
import { WeekendSettingsService } from './weekend_settings.service';
import { CreateWeekendDto } from './dto/create-weekend_setting.dto';
import { WeekDayEnum } from '../../common/enums/WeekDayEnum.enum';
import { WeekNumberEnum } from '../../common/enums/WeekNumberEnum.enum';

describe('WeekendSettingsController', () => {
  let controller: WeekendSettingsController;
  let service: WeekendSettingsService;

  const mockWeekend = {
    id: 'wk-123',
    day: WeekDayEnum.SATURDAY,
    weekNumber: WeekNumberEnum.ALL,
    isOff: true,
  };

  const mockWeekendSettingsService = {
    create: jest.fn().mockResolvedValue([mockWeekend]),
    findAll: jest.fn().mockResolvedValue([mockWeekend]),
    remove: jest
      .fn()
      .mockResolvedValue({ message: 'Weekend deleted successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeekendSettingsController],
      providers: [
        {
          provide: WeekendSettingsService,
          useValue: mockWeekendSettingsService,
        },
      ],
    }).compile();

    controller = module.get<WeekendSettingsController>(
      WeekendSettingsController,
    );
    service = module.get<WeekendSettingsService>(WeekendSettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return array of weekend settings', async () => {
      const dto: CreateWeekendDto[] = [
        {
          day: WeekDayEnum.SATURDAY,
          weekNumber: WeekNumberEnum.ALL,
          isOff: true,
        },
      ];
      const result = await controller.create(dto);
      expect(result).toEqual([mockWeekend]);
      expect(mockWeekendSettingsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return weekend settings', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockWeekend]);
      expect(mockWeekendSettingsService.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should call service.remove and return success message', async () => {
      const result = await controller.remove('wk-123');
      expect(result).toEqual({ message: 'Weekend deleted successfully' });
      expect(mockWeekendSettingsService.remove).toHaveBeenCalledWith('wk-123');
    });
  });
});
