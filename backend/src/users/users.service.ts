import { Injectable, Inject } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async getMe(userId: string) {
    const users = this.db.collection('users');
    const parentChildren = this.db.collection('parent_children');
    const children = this.db.collection('children');
    const groups = this.db.collection('groups');

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return null;

    const links = await parentChildren.find({ parentId: userId }).toArray();
    const childIds = links.map(l => new ObjectId(l.childId));

    let userChildren: any[] = [];
    if (childIds.length > 0) {
      userChildren = await children.find({ _id: { $in: childIds } }).toArray();
      
      for (const child of userChildren) {
        if (child.groupId) {
          const group = await groups.findOne({ _id: new ObjectId(child.groupId) });
          child.group = group ? { id: group._id.toString(), ...group, _id: undefined } : null;
        }
        child.id = child._id.toString();
        delete child._id;
      }
    }

    const { _id, ...userWithoutId } = user;
    return {
      id: _id.toString(),
      ...userWithoutId,
      children: userChildren,
    };
  }
}
