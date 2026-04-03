export interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  role: 'PARENT' | 'STUDENT' | 'COACH' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  children?: Child[];
}

export interface Child {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
  note?: string;
  groupId?: string;
  group?: Group;
  coach?: Coach;
  location?: Location;
}

export interface Group {
  id: string;
  name: string;
  ageRange?: string;
  level?: string;
  capacity?: number;
  description?: string;
  coach?: Coach;
  location?: Location;
  childrenCount?: number;
}

export interface Coach {
  id: string;
  firstName: string;
  lastName?: string;
  telegramId?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city?: string;
  lat?: number;
  lng?: number;
  description?: string;
  groupsCount?: number;
}

export interface ScheduleItem {
  scheduleId: string;
  date: string;
  status: 'ACTIVE' | 'CANCELLED' | 'MOVED';
  startTime: string;
  endTime: string;
  note?: string;
  group?: Group;
  coach?: Coach;
  location?: Location;
}

export interface Attendance {
  id: string;
  childId: string;
  scheduleId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'WARNED' | 'LATE' | 'CANCELLED';
  reason?: string;
  comment?: string;
}

export interface Payment {
  id: string;
  childId: string;
  child?: { id: string; firstName: string; lastName?: string };
  amount: number;
  currency: string;
  description?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'PAID' | 'REJECTED';
  proofUrl?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
}

export interface ContentPost {
  id: string;
  title: string;
  body?: string;
  type: 'NEWS' | 'EVENT' | 'VIDEO' | 'PHOTO' | 'ANNOUNCEMENT';
  visibility: 'GROUP' | 'LOCATION' | 'GLOBAL';
  mediaUrl?: string;
  isPinned: boolean;
  publishedAt: string;
  groupId?: string;
  locationId?: string;
  author?: { id: string; firstName: string; lastName?: string };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}
