import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { CreateChildDto } from './dto/create-child.dto';
import { ChildStatus } from '../common/enums';

@Injectable()
export class ChildrenService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async getMine(parentId: string) {
    const parentChildren = this.db.collection('parent_children');
    const children = this.db.collection('children');
    const groups = this.db.collection('groups');
    const locations = this.db.collection('locations');
    const users = this.db.collection('users');

    const links = await parentChildren.find({ parentId }).toArray();
    const childIds = links.map(l => new ObjectId(l.childId));

    if (childIds.length === 0) return [];

    const childDocs = await children.find({ _id: { $in: childIds } }).toArray();

    const result = [];
    for (const child of childDocs) {
      let group = null;
      let coach = null;
      let location = null;

      if (child.groupId) {
        group = await groups.findOne({ _id: new ObjectId(child.groupId) });
        if (group) {
          if (group.coachId) {
            coach = await users.findOne({ _id: new ObjectId(group.coachId) });
          }
          if (group.locationId) {
            location = await locations.findOne({ _id: new ObjectId(group.locationId) });
          }
        }
      }

      result.push({
        id: child._id.toString(),
        firstName: child.firstName,
        lastName: child.lastName,
        birthDate: child.birthDate,
        status: child.status,
        note: child.note,
        groupId: child.groupId,
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

    return result;
  }

  async createForParent(parentId: string, dto: CreateChildDto) {
    const children = this.db.collection('children');
    const parentChildren = this.db.collection('parent_children');

    const newChild = {
      firstName: dto.firstName,
      lastName: dto.lastName || null,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      note: dto.note || null,
      groupId: dto.groupId || null,
      status: ChildStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await children.insertOne(newChild);
    const childId = result.insertedId.toString();

    await parentChildren.insertOne({
      parentId,
      childId,
      relation: 'parent',
      createdAt: new Date(),
    });

    return {
      id: childId,
      ...newChild,
    };
  }

  async getOneForParent(parentId: string, childId: string) {
    const parentChildren = this.db.collection('parent_children');
    const children = this.db.collection('children');
    const attendance = this.db.collection('attendance');
    const payments = this.db.collection('payments');
    const groups = this.db.collection('groups');
    const users = this.db.collection('users');
    const locations = this.db.collection('locations');

    const link = await parentChildren.findOne({ parentId, childId });
    if (!link) {
      throw new ForbiddenException('No access to this child');
    }

    const child = await children.findOne({ _id: new ObjectId(childId) });
    if (!child) {
      throw new ForbiddenException('Child not found');
    }

    const attendanceRecords = await attendance
      .find({ childId })
      .sort({ date: -1 })
      .limit(50)
      .toArray();

    const paymentRecords = await payments
      .find({ childId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    let group = null;
    let coach = null;
    let location = null;

    if (child.groupId) {
      group = await groups.findOne({ _id: new ObjectId(child.groupId) });
      if (group) {
        if (group.coachId) {
          coach = await users.findOne({ _id: new ObjectId(group.coachId) });
        }
        if (group.locationId) {
          location = await locations.findOne({ _id: new ObjectId(group.locationId) });
        }
      }
    }

    return {
      child: {
        id: child._id.toString(),
        firstName: child.firstName,
        lastName: child.lastName,
        birthDate: child.birthDate,
        status: child.status,
        note: child.note,
        groupId: child.groupId,
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
          lat: location.lat,
          lng: location.lng,
        } : null,
      },
      attendances: attendanceRecords.map(a => ({
        id: a._id.toString(),
        childId: a.childId,
        scheduleId: a.scheduleId,
        date: a.date,
        status: a.status,
        reason: a.reason,
        comment: a.comment,
      })),
      payments: paymentRecords.map(p => ({
        id: p._id.toString(),
        childId: p.childId,
        amount: p.amount,
        currency: p.currency,
        description: p.description,
        status: p.status,
        dueDate: p.dueDate,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    };
  }
}
