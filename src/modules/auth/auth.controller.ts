import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(
    @Body()
    dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  @Get('me')
  getProfile(
    @CurrentUser()
    user: any,
  ) {
    return user;
  }

  @Public()
  @Post('refresh-token')
  refreshToken(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  logout(
    @Body()
    dto: LogoutDto,
  ) {
    return this.authService.logout(dto.refreshToken);
  }
}
