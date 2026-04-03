import { Injectable, Inject } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class ScheduleService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async getExpandedSchedule(groupId?: string, from?: string, to?: string) {
    const schedules = this.db.collection('schedules');
    const scheduleOverrides = this.db.collection('schedule_overrides');
    const groups = this.db.collection('groups');
    const users = this.db.collection('users');
    const locations = this.db.collection('locations');

    const fromDate = from ? new Date(from) : new Date();
    const toDate = to ? new Date(to) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const query: any = { isActive: true };
    if (groupId) {
      query.groupId = groupId;
    }

    const scheduleDocs = await schedules.find(query).toArray();
    const scheduleIds = scheduleDocs.map(s => s._id.toString());

    const overrides = await scheduleOverrides.find({
      scheduleId: { $in: scheduleIds },
      date: { $gte: fromDate, $lte: toDate },
    }).toArray();

    const groupIds = [...new Set(scheduleDocs.map(s => s.groupId))];
    const groupDocs = groupIds.length > 0
      ? await groups.find({ _id: { $in: groupIds.map(id => new ObjectId(id)) } }).toArray()
      : [];

    const coachIds = [...new Set(groupDocs.map(g => g.coachId).filter(Boolean))];
    const locationIds = [...new Set(groupDocs.map(g => g.locationId).filter(Boolean))];

    const coaches = coachIds.length > 0
      ? await users.find({ _id: { $in: coachIds.map(id => new ObjectId(id)) } }).toArray()
      : [];
    const locationDocs = locationIds.length > 0
      ? await locations.find({ _id: { $in: locationIds.map(id => new ObjectId(id)) } }).toArray()
      : [];

    const result: any[] = [];

    for (let d = new Date(fromDate); d <= toDate; d = new Date(d.getTime() + 86400000)) {
      const jsDay = d.getDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;

      for (const schedule of scheduleDocs) {
        if (schedule.dayOfWeek !== dayOfWeek) continue;

        const override = overrides.find(o => {
          const od = new Date(o.date);
          return o.scheduleId === schedule._id.toString() && od.toDateString() === d.toDateString();
        });

        const group = groupDocs.find(g => g._id.toString() === schedule.groupId);
        const coach = group?.coachId ? coaches.find(c => c._id.toString() === group.coachId) : null;
        const location = group?.locationId ? locationDocs.find(l => l._id.toString() === group.locationId) : null;

        result.push({
          scheduleId: schedule._id.toString(),
          date: new Date(d).toISOString(),
          status: override?.status || 'ACTIVE',
          startTime: override?.newStartTime || schedule.startTime,
          endTime: override?.newEndTime || schedule.endTime,
          note: override?.note || null,
          group: group ? {
            id: group._id.toString(),
            name: group.name,
            ageRange: group.ageRange,
            level: group.level,
          } : null,
          coach: coach ? {
            id: coach._id.toString(),
            firstName: coach.firstName,
            lastName: coach.lastName,
          } : null,
          location: location ? {
            id: location._id.toString(),
            name: location.name,
            address: location.address,
          } : null,
        });
      }
    }

    return result.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (diff !== 0) return diff;
      return a.startTime.localeCompare(b.startTime);
    });
  }
}
