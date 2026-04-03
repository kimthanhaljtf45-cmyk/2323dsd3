import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole } from '../common/enums';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, ReportAbsenceDto } from './dto/attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(AppRole.COACH, AppRole.ADMIN, AppRole.SUPER_ADMIN)
  async mark(@CurrentUser() user: any, @Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(user.id, dto);
  }

  @Post('report-absence')
  @Roles(AppRole.PARENT, AppRole.ADMIN, AppRole.SUPER_ADMIN)
  async reportAbsence(@CurrentUser() user: any, @Body() dto: ReportAbsenceDto) {
    return this.attendanceService.reportAbsence(user.id, dto);
  }

  @Get('child/:childId')
  async getChildAttendance(@Param('childId') childId: string) {
    return this.attendanceService.getChildAttendance(childId);
  }
}
