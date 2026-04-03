import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMine(@CurrentUser() user: any) {
    return this.notificationsService.getMine(user.id);
  }

  @Post('read')
  async markRead(@CurrentUser() user: any, @Body() body: { notificationId: string }) {
    return this.notificationsService.markRead(user.id, body.notificationId);
  }
}
