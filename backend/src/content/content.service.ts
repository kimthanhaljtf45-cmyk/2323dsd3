import { Injectable, Inject } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { CreateContentDto } from './dto/create-content.dto';
import { ContentVisibility } from '../common/enums';

@Injectable()
export class ContentService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async getFeedForUser(userId: string) {
    const users = this.db.collection('users');
    const parentChildren = this.db.collection('parent_children');
    const children = this.db.collection('children');
    const groups = this.db.collection('groups');
    const content = this.db.collection('content_posts');

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return [];

    let groupIds: string[] = [];
    let locationIds: string[] = [];

    if (user.role === 'PARENT') {
      const links = await parentChildren.find({ parentId: userId }).toArray();
      const childIds = links.map(l => new ObjectId(l.childId));

      if (childIds.length > 0) {
        const userChildren = await children.find({ _id: { $in: childIds } }).toArray();
        groupIds = userChildren.map(c => c.groupId).filter(Boolean);

        if (groupIds.length > 0) {
          const userGroups = await groups.find({ 
            _id: { $in: groupIds.map(id => new ObjectId(id)) } 
          }).toArray();
          locationIds = userGroups.map(g => g.locationId).filter(Boolean);
        }
      }
    }

    const query: any = {
      $or: [
        { visibility: ContentVisibility.GLOBAL },
      ],
    };

    if (groupIds.length > 0) {
      query.$or.push({ visibility: ContentVisibility.GROUP, groupId: { $in: groupIds } });
    }
    if (locationIds.length > 0) {
      query.$or.push({ visibility: ContentVisibility.LOCATION, locationId: { $in: locationIds } });
    }

    const posts = await content
      .find(query)
      .sort({ isPinned: -1, publishedAt: -1 })
      .limit(100)
      .toArray();

    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const authors = authorIds.length > 0
      ? await users.find({ _id: { $in: authorIds.map(id => new ObjectId(id)) } }).toArray()
      : [];

    return posts
      .map(p => {
        const author = authors.find(a => a._id.toString() === p.authorId);
        return {
          id: p._id.toString(),
          title: p.title,
          body: p.body,
          type: p.type,
          visibility: p.visibility,
          mediaUrl: p.mediaUrl,
          isPinned: p.isPinned,
          publishedAt: p.publishedAt,
          groupId: p.groupId,
          locationId: p.locationId,
          author: author ? {
            id: author._id.toString(),
            firstName: author.firstName,
            lastName: author.lastName,
          } : null,
        };
      })
      .sort((a, b) => {
        const rank = (p: any) => {
          if (p.groupId && groupIds.includes(p.groupId)) return 1;
          if (p.locationId && locationIds.includes(p.locationId)) return 2;
          return 3;
        };
        const diff = rank(a) - rank(b);
        if (diff !== 0) return diff;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }

  async create(authorId: string, dto: CreateContentDto) {
    const content = this.db.collection('content_posts');

    const newPost = {
      authorId,
      title: dto.title,
      body: dto.body || null,
      type: dto.type,
      visibility: dto.visibility,
      mediaUrl: dto.mediaUrl || null,
      isPinned: dto.isPinned || false,
      groupId: dto.groupId || null,
      locationId: dto.locationId || null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await content.insertOne(newPost);

    return {
      id: result.insertedId.toString(),
      ...newPost,
    };
  }
}
