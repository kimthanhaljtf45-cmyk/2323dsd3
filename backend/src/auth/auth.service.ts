import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Db, ObjectId } from 'mongodb';
import { TelegramAuthService } from './telegram-auth.service';
import { AppRole, UserStatus } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Db,
    private readonly jwtService: JwtService,
    private readonly telegramAuthService: TelegramAuthService,
  ) {}

  async loginWithTelegram(initData: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken || botToken === 'change_me') {
      throw new Error('Telegram bot token not configured');
    }
    
    const data = this.telegramAuthService.validateInitData(initData, botToken);
    const telegramUser = JSON.parse(data.user);

    return this.findOrCreateUser({
      telegramId: String(telegramUser.id),
      firstName: telegramUser.first_name || '',
      lastName: telegramUser.last_name || null,
      username: telegramUser.username || null,
    });
  }

  async mockLogin(telegramId: string, firstName: string, lastName?: string, username?: string) {
    return this.findOrCreateUser({
      telegramId,
      firstName,
      lastName: lastName || null,
      username: username || null,
    });
  }

  private async findOrCreateUser(userData: {
    telegramId: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
  }) {
    const users = this.db.collection('users');
    
    let user = await users.findOne({ telegramId: userData.telegramId });

    if (!user) {
      const newUser = {
        telegramId: userData.telegramId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        phone: null,
        role: AppRole.PARENT,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await users.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    const accessToken = this.jwtService.sign({
      sub: user._id.toString(),
      telegramId: user.telegramId,
      role: user.role,
    });

    const { _id, ...userWithoutId } = user;

    return {
      accessToken,
      user: {
        id: _id.toString(),
        ...userWithoutId,
      },
    };
  }
}
