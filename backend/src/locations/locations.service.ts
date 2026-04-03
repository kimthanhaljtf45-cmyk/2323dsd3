import { Injectable, Inject } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class LocationsService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async getAll() {
    const locations = this.db.collection('locations');
    const groups = this.db.collection('groups');

    const locationDocs = await locations.find().sort({ name: 1 }).toArray();

    const result = [];
    for (const loc of locationDocs) {
      const locationGroups = await groups.find({ locationId: loc._id.toString() }).toArray();

      result.push({
        id: loc._id.toString(),
        name: loc.name,
        address: loc.address,
        city: loc.city,
        lat: loc.lat,
        lng: loc.lng,
        description: loc.description,
        groupsCount: locationGroups.length,
      });
    }

    return result;
  }

  async getById(id: string) {
    const locations = this.db.collection('locations');
    const groups = this.db.collection('groups');
    const users = this.db.collection('users');

    const location = await locations.findOne({ _id: new ObjectId(id) });
    if (!location) return null;

    const locationGroups = await groups.find({ locationId: id }).toArray();

    const groupsWithCoaches = [];
    for (const group of locationGroups) {
      let coach = null;
      if (group.coachId) {
        coach = await users.findOne({ _id: new ObjectId(group.coachId) });
      }

      groupsWithCoaches.push({
        id: group._id.toString(),
        name: group.name,
        ageRange: group.ageRange,
        level: group.level,
        coach: coach ? {
          id: coach._id.toString(),
          firstName: coach.firstName,
          lastName: coach.lastName,
        } : null,
      });
    }

    return {
      id: location._id.toString(),
      name: location.name,
      address: location.address,
      city: location.city,
      lat: location.lat,
      lng: location.lng,
      description: location.description,
      groups: groupsWithCoaches,
    };
  }
}
