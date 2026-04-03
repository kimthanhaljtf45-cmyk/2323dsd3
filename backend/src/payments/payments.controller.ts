import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole } from '../common/enums';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto/payments.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(AppRole.PARENT, AppRole.ADMIN, AppRole.SUPER_ADMIN)
  async list(@CurrentUser() user: any) {
    return this.paymentsService.listForParent(user.id);
  }

  @Post('create')
  @Roles(AppRole.ADMIN, AppRole.SUPER_ADMIN)
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Post('confirm')
  @Roles(AppRole.PARENT, AppRole.ADMIN, AppRole.SUPER_ADMIN)
  async confirm(@CurrentUser() user: any, @Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmByParent(user.id, dto);
  }

  @Post('approve/:id')
  @Roles(AppRole.ADMIN, AppRole.SUPER_ADMIN)
  async approve(@CurrentUser() user: any, @Param('id') id: string) {
    return this.paymentsService.approve(user.id, id);
  }
}
