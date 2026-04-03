import { IsString, IsOptional, IsEnum } from 'class-validator';

export class MarkAttendanceDto {
  @IsString()
  childId: string;

  @IsString()
  scheduleId: string;

  @IsString()
  date: string;

  @IsEnum(['PRESENT', 'ABSENT', 'WARNED', 'LATE', 'CANCELLED'])
  status: 'PRESENT' | 'ABSENT' | 'WARNED' | 'LATE' | 'CANCELLED';

  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReportAbsenceDto {
  @IsString()
  childId: string;

  @IsString()
  scheduleId: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
