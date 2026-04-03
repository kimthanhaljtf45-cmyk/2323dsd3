import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { MarkAttendanceDto, ReportAbsenceDto } from './dto/attendance.dto';
import { AttendanceStatus } from '../common/enums';

@Injectable()
export class AttendanceService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async markAttendance(coachId: string, dto: MarkAttendanceDto) {
    const schedules = this.db.collection('schedules');
    const groups = this.db.collection('groups');
    const attendance = this.db.collection('attendance');

    const schedule = await schedules.findOne({ _id: new ObjectId(dto.scheduleId) });
    if (!schedule) {
      throw new ForbiddenException('Schedule not found');
    }

    const group = await groups.findOne({ _id: new ObjectId(schedule.groupId) });
    if (!group || group.coachId !== coachId) {
      throw new ForbiddenException('No access to this schedule');
    }

    const filter = {
      childId: dto.childId,
      scheduleId: dto.scheduleId,
      date: new Date(dto.date),
    };

    const update = {
      $set: {
        status: dto.status,
        comment: dto.comment || null,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        childId: dto.childId,
        scheduleId: dto.scheduleId,
        date: new Date(dto.date),
        createdAt: new Date(),
      },
    };

    const result = await attendance.findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: 'after',
    });

    return {
      id: result._id.toString(),
      childId: result.childId,
      scheduleId: result.scheduleId,
      date: result.date,
      status: result.status,
      comment: result.comment,
    };
  }

  async reportAbsence(parentId: string, dto: ReportAbsenceDto) {
    const parentChildren = this.db.collection('parent_children');
    const attendance = this.db.collection('attendance');

    const relation = await parentChildren.findOne({
      parentId,
      childId: dto.childId,
    });

    if (!relation) {
      throw new ForbiddenException('No access to this child');
    }

    const filter = {
      childId: dto.childId,
      scheduleId: dto.scheduleId,
      date: new Date(dto.date),
    };

    const update = {
      $set: {
        status: AttendanceStatus.WARNED,
        reason: dto.reason || null,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        childId: dto.childId,
        scheduleId: dto.scheduleId,
        date: new Date(dto.date),
        createdAt: new Date(),
      },
    };

    const result = await attendance.findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: 'after',
    });

    return {
      id: result._id.toString(),
      childId: result.childId,
      scheduleId: result.scheduleId,
      date: result.date,
      status: result.status,
      reason: result.reason,
    };
  }

  async getChildAttendance(childId: string) {
    const attendance = this.db.collection('attendance');

    const records = await attendance
      .find({ childId })
      .sort({ date: -1 })
      .toArray();

    return records.map(r => ({
      id: r._id.toString(),
      childId: r.childId,
      scheduleId: r.scheduleId,
      date: r.date,
      status: r.status,
      reason: r.reason,
      comment: r.comment,
    }));
  }
}
