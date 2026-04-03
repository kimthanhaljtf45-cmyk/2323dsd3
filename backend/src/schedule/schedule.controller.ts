import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScheduleService } from './schedule.service';
import { GetScheduleDto } from './dto/get-schedule.dto';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async get(@Query() query: GetScheduleDto) {
    return this.scheduleService.getExpandedSchedule(query.groupId, query.from, query.to);
  }
}
