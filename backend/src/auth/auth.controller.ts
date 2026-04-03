import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramAuthDto, MockAuthDto } from './dto/telegram-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegramLogin(@Body() dto: TelegramAuthDto) {
    return this.authService.loginWithTelegram(dto.initData);
  }

  @Post('mock')
  async mockLogin(@Body() dto: MockAuthDto) {
    return this.authService.mockLogin(
      dto.telegramId,
      dto.firstName,
      dto.lastName,
      dto.username,
    );
  }
}
