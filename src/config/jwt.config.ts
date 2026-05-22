import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
// import { config } from 'node:process';
// import { config } from 'process';
// import { config } from 'dotenv';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET as string,
    // secret: "mySecretKey123",

    signOptions: {
      // expiresIn: '15d',
      expiresIn: process.env.JWT_EXPIRES_IN as '15m',
    },
  }),
);
