import { Injectable, Inject } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class GroupsService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async getAll() {
    const groups = this.db.collection('groups');
    const users = this.db.collection('users');
    const locations = this.db.collection('locations');
    const children = this.db.collection('children');

    const groupDocs = await groups.find().sort({ name: 1 }).toArray();

    const result = [];
    for (const group of groupDocs) {
      let coach = null;
      let location = null;

      if (group.coachId) {
        coach = await users.findOne({ _id: new ObjectId(group.coachId) });
      }
      if (group.locationId) {
        location = await locations.findOne({ _id: new ObjectId(group.locationId) });
      }

      const childrenCount = await children.countDocuments({ groupId: group._id.toString() });

      result.push({
        id: group._id.toString(),
        name: group.name,
        ageRange: group.ageRange,
        level: group.level,
        capacity: group.capacity,
        description: group.description,
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
        childrenCount,
      });
    }

    return result;
  }

  async getById(id: string) {
    const groups = this.db.collection('groups');
    const users = this.db.collection('users');
    const locations = this.db.collection('locations');
    const children = this.db.collection('children');
    const schedules = this.db.collection('schedules');

    const group = await groups.findOne({ _id: new ObjectId(id) });
    if (!group) return null;

    let coach = null;
    let location = null;

    if (group.coachId) {
      coach = await users.findOne({ _id: new ObjectId(group.coachId) });
    }
    if (group.locationId) {
      location = await locations.findOne({ _id: new ObjectId(group.locationId) });
    }

    const groupChildren = await children.find({ groupId: id }).toArray();
    const groupSchedules = await schedules.find({ groupId: id, isActive: true }).toArray();

    return {
      id: group._id.toString(),
      name: group.name,
      ageRange: group.ageRange,
      level: group.level,
      capacity: group.capacity,
      description: group.description,
      coach: coach ? {
        id: coach._id.toString(),
        firstName: coach.firstName,
        lastName: coach.lastName,
      } : null,
      location: location ? {
        id: location._id.toString(),
        name: location.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
      } : null,
      children: groupChildren.map(c => ({
        id: c._id.toString(),
        firstName: c.firstName,
        lastName: c.lastName,
      })),
      schedules: groupSchedules.map(s => ({
        id: s._id.toString(),
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    };
  }
}
