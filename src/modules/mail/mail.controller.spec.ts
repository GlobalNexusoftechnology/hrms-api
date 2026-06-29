import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

describe('MailController', () => {
  let controller: MailController;
  let service: MailService;

  const mockMailService = {
    sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('testEmail', () => {
    it('should call mailService.sendResetPasswordEmail and return success object', async () => {
      const result = await controller.testEmail();
      expect(result).toEqual({
        success: true,
        message: 'Test email sent successfully',
      });
      expect(mockMailService.sendResetPasswordEmail).toHaveBeenCalled();
    });
  });
});
