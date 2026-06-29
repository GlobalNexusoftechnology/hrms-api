import { Test, TestingModule } from '@nestjs/testing';
import { WeekendSettingsService } from './weekend_settings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WeekendSetting } from './entities/weekend_setting.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WeekDayEnum } from '../../common/enums/WeekDayEnum.enum';
import { WeekNumberEnum } from '../../common/enums/WeekNumberEnum.enum';

describe('WeekendSettingsService', () => {
  let service: WeekendSettingsService;
  let repository: any;
  let localWeekend: any;

  const mockWeekendTemplate = {
    id: 'wk-123',
    day: WeekDayEnum.SATURDAY,
    weekNumber: WeekNumberEnum.ALL,
    isOff: true,
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    localWeekend = { ...mockWeekendTemplate };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeekendSettingsService,
        {
          provide: getRepositoryToken(WeekendSetting),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WeekendSettingsService>(WeekendSettingsService);
    repository = module.get(getRepositoryToken(WeekendSetting));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = [
      {
        day: WeekDayEnum.SATURDAY,
        weekNumber: WeekNumberEnum.ALL,
        isOff: true,
      },
    ];

    it('should successfully save settings', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue([localWeekend]);

      const result = await service.create(createDto);
      expect(result).toEqual([localWeekend]);
    });

    it('should throw BadRequestException if setting already exists', async () => {
      repository.findOne.mockResolvedValue(localWeekend);
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all weekend settings sorted', async () => {
      repository.find.mockResolvedValue([localWeekend]);
      const result = await service.findAll();
      expect(result).toEqual([localWeekend]);
      expect(repository.find).toHaveBeenCalledWith({ order: { day: 'ASC' } });
    });
  });

  describe('remove', () => {
    it('should delete weekend setting', async () => {
      repository.findOne.mockResolvedValue(localWeekend);
      repository.remove.mockResolvedValue(localWeekend);

      const result = await service.remove('wk-123');
      expect(result).toEqual({ message: 'Weekend deleted successfully' });
      expect(repository.remove).toHaveBeenCalledWith(localWeekend);
    });

    it('should throw NotFoundException if setting to delete does not exist', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.remove('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
