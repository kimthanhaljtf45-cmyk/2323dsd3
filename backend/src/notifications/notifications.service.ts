import { Injectable, Inject } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class NotificationsService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async getMine(userId: string) {
    const notifications = this.db.collection('notifications');

    const docs = await notifications
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return docs.map(n => ({
      id: n._id.toString(),
      userId: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  async markRead(userId: string, notificationId: string) {
    const notifications = this.db.collection('notifications');

    await notifications.updateOne(
      { _id: new ObjectId(notificationId), userId },
      { $set: { isRead: true } },
    );

    return { success: true };
  }
}
