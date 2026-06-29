import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET,
    // secret: "mySecretKey123",

    signOptions: {
      // expiresIn: '15d',
      expiresIn: process.env.JWT_EXPIRES_IN as '15m',
    },
  }),
);
