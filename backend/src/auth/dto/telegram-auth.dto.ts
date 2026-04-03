import { IsString } from 'class-validator';

export class TelegramAuthDto {
  @IsString()
  initData: string;
}

export class MockAuthDto {
  @IsString()
  telegramId: string;

  @IsString()
  firstName: string;

  lastName?: string;
  username?: string;
}
