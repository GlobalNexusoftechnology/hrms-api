import { Test, TestingModule } from '@nestjs/testing';
import { HolidayService } from './holiday.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HolidayTypeEnum } from '../../common/enums/HolidayTypeEnum.enum';

describe('HolidayService', () => {
  let service: HolidayService;
  let repository: any;
  let localHoliday: any;

  const mockHolidayTemplate = {
    id: 'hol-123',
    name: 'New Year',
    date: '2026-01-01',
    type: HolidayTypeEnum.NATIONAL,
    isPaid: true,
  };

  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    localHoliday = { ...mockHolidayTemplate };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HolidayService,
        {
          provide: getRepositoryToken(Holiday),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<HolidayService>(HolidayService);
    repository = module.get(getRepositoryToken(Holiday));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'New Year',
      date: '2026-01-01',
      type: HolidayTypeEnum.NATIONAL,
      isPaid: true,
    };

    it('should successfully create holiday', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue(localHoliday);

      const result = await service.create(createDto);
      expect(result).toEqual(localHoliday);
    });

    it('should throw BadRequestException if holiday exists on date', async () => {
      repository.findOne.mockResolvedValue(localHoliday);
      await expect(service.create(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should build query and return holidays list', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([localHoliday]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        month: 1,
        year: 2026,
        type: HolidayTypeEnum.NATIONAL,
      });
      expect(result).toEqual([localHoliday]);
    });
  });

  describe('findOne', () => {
    it('should return holiday if found', async () => {
      repository.findOne.mockResolvedValue(localHoliday);
      const result = await service.findOne('hol-123');
      expect(result).toEqual(localHoliday);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should successfully update holiday details', async () => {
      repository.findOne
        .mockResolvedValueOnce(localHoliday) // inside findOne
        .mockResolvedValueOnce(null); // date collision check

      repository.save.mockResolvedValue({
        ...localHoliday,
        name: 'Holiday Updated',
      });

      const result = await service.update('hol-123', {
        name: 'Holiday Updated',
        date: '2026-01-02',
      });
      expect(result.name).toBe('Holiday Updated');
    });

    it('should throw BadRequestException if date collision occurs on update', async () => {
      repository.findOne
        .mockResolvedValueOnce(localHoliday) // inside findOne
        .mockResolvedValueOnce({ id: 'other-id' }); // date collision check finds other

      await expect(
        service.update('hol-123', { date: '2026-01-02' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete holiday', async () => {
      repository.findOne.mockResolvedValue(localHoliday);
      repository.remove.mockResolvedValue(localHoliday);

      const result = await service.remove('hol-123');
      expect(result).toEqual({ message: 'Holiday deleted successfully' });
      expect(repository.remove).toHaveBeenCalledWith(localHoliday);
    });
  });
});
