import { Test, TestingModule } from '@nestjs/testing';
import { HrInterviewController } from './hr-interview.controller';
import { InterviewService } from './interview.service';

describe('HrInterviewController', () => {
  let controller: HrInterviewController;
  let service: InterviewService;

  const mockCandidate = { id: 'cand-123', email: 'c@example.com' };
  const mockInterview = { id: 'int-123', roundName: 'Technical' };

  const mockInterviewService = {
    createCandidate: jest.fn().mockResolvedValue(mockCandidate),
    getCandidates: jest.fn().mockResolvedValue([mockCandidate]),
    getCandidate: jest.fn().mockResolvedValue(mockCandidate),
    updateCandidate: jest.fn().mockResolvedValue(mockCandidate),
    updateCandidateStatus: jest.fn().mockResolvedValue(mockCandidate),
    convertToEmployee: jest.fn().mockResolvedValue({ success: true }),
    scheduleInterview: jest.fn().mockResolvedValue(mockInterview),
    getInterviews: jest.fn().mockResolvedValue([mockInterview]),
    getInterview: jest.fn().mockResolvedValue({ interview: mockInterview }),
    addFeedback: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrInterviewController],
      providers: [
        {
          provide: InterviewService,
          useValue: mockInterviewService,
        },
      ],
    }).compile();

    controller = module.get<HrInterviewController>(HrInterviewController);
    service = module.get<InterviewService>(InterviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCandidate', () => {
    it('should call service.createCandidate', async () => {
      const dto = { email: 'c@example.com', mobile: '123' };
      const result = await controller.createCandidate(dto as any);
      expect(result).toEqual(mockCandidate);
      expect(mockInterviewService.createCandidate).toHaveBeenCalledWith(dto);
    });
  });

  describe('getCandidates', () => {
    it('should call service.getCandidates', async () => {
      const result = await controller.getCandidates();
      expect(result).toEqual([mockCandidate]);
      expect(mockInterviewService.getCandidates).toHaveBeenCalled();
    });
  });

  describe('scheduleInterview', () => {
    it('should call service.scheduleInterview', async () => {
      const dto = { candidateId: 'cand-123', scheduledAt: '2026-06-30' };
      const result = await controller.scheduleInterview(dto as any);
      expect(result).toEqual(mockInterview);
      expect(mockInterviewService.scheduleInterview).toHaveBeenCalledWith(dto);
    });
  });
});
