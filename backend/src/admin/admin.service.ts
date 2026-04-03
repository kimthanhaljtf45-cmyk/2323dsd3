import { Injectable, Inject } from '@nestjs/common';
import { Db } from 'mongodb';
import { AppRole, PaymentStatus } from '../common/enums';

@Injectable()
export class AdminService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async dashboard() {
    const users = this.db.collection('users');
    const children = this.db.collection('children');
    const groups = this.db.collection('groups');
    const locations = this.db.collection('locations');
    const payments = this.db.collection('payments');
    const attendance = this.db.collection('attendance');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalUsers,
      totalParents,
      totalCoaches,
      totalChildren,
      totalGroups,
      totalLocations,
      pendingPayments,
      paidPayments,
      todayAttendance,
    ] = await Promise.all([
      users.countDocuments(),
      users.countDocuments({ role: AppRole.PARENT }),
      users.countDocuments({ role: AppRole.COACH }),
      children.countDocuments(),
      groups.countDocuments(),
      locations.countDocuments(),
      payments.countDocuments({ status: PaymentStatus.UNDER_REVIEW }),
      payments.countDocuments({ status: PaymentStatus.PAID }),
      attendance.countDocuments({
        date: { $gte: today, $lt: tomorrow },
      }),
    ]);

    return {
      totalUsers,
      totalParents,
      totalCoaches,
      totalChildren,
      totalGroups,
      totalLocations,
      pendingPayments,
      paidPayments,
      todayAttendance,
    };
  }

  async getAllUsers() {
    const users = this.db.collection('users');
    const docs = await users.find().sort({ createdAt: -1 }).toArray();

    return docs.map(u => ({
      id: u._id.toString(),
      telegramId: u.telegramId,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));
  }

  async getAllPayments() {
    const payments = this.db.collection('payments');
    const children = this.db.collection('children');

    const docs = await payments.find().sort({ createdAt: -1 }).toArray();
    const childIds = [...new Set(docs.map(p => p.childId))];

    const childDocs = childIds.length > 0
      ? await children.find({ _id: { $in: childIds.map(id => new (require('mongodb').ObjectId)(id)) } }).toArray()
      : [];

    return docs.map(p => {
      const child = childDocs.find(c => c._id.toString() === p.childId);
      return {
        id: p._id.toString(),
        childId: p.childId,
        child: child ? {
          id: child._id.toString(),
          firstName: child.firstName,
          lastName: child.lastName,
        } : null,
        amount: p.amount,
        currency: p.currency,
        description: p.description,
        status: p.status,
        proofUrl: p.proofUrl,
        dueDate: p.dueDate,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      };
    });
  }
}
