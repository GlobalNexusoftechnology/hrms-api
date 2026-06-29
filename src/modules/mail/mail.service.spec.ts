import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let service: MailService;
  let mailerService: any;

  beforeEach(async () => {
    const mockMailerService = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendResetPasswordEmail', () => {
    it('should successfully trigger sendMail with valid payload', async () => {
      await service.sendResetPasswordEmail(
        'john@example.com',
        'John',
        'http://reset.link',
      );
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'john@example.com',
        subject: 'Reset Your Password',
        html: expect.stringContaining('http://reset.link'),
      });
    });
  });
});
