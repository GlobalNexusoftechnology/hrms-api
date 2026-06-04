import { Controller, Post } from '@nestjs/common';

import { MailService } from './mail.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // =====================
  // TEST EMAIL
  // =====================

  @Public()
  @Post('test')
  async testEmail() {
    await this.mailService.sendResetPasswordEmail(
      process.env.SMTP_USER!,
      'Mubasshir',
      'https://google.com',
    );

    return {
      success: true,
      message: 'Test email sent successfully',
    };
  }
}
