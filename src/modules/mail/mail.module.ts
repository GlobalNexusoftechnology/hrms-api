import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('SMTP_HOST:', configService.get('SMTP_HOST'));
        console.log('SMTP_PORT:', configService.get('SMTP_PORT'));

        return {
          transport: {
            host: configService.get<string>('SMTP_HOST'),
            port: Number(configService.get('SMTP_PORT')),
            secure: false,
            auth: {
              user: configService.get<string>('SMTP_USER'),
              pass: configService.get<string>('SMTP_PASS'),
            },
          },
          defaults: {
            from: configService.get<string>('MAIL_FROM'),
          },
        };
      },
    }),
  ],

  providers: [MailService],

  exports: [MailService],

  controllers: [MailController],
})
export class MailModule {}
