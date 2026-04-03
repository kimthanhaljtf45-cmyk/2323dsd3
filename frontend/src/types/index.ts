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
  createdAt?: string;
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
  attendance?: AttendanceStats;
  goal?: { target: number; current: number };
  coachComment?: string;
  achievements?: Achievement[];
  payments?: Payment[];
}

export interface AttendanceStats {
  monthTotal: number;
  present: number;
  warned: number;
  absent: number;
  percent: number;
  streak?: number;
}

export interface Achievement {
  id: string;
  childId: string;
  title: string;
  description?: string;
  type: string;
  awardedAt: string;
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
  phone?: string;
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
  id: string;
  scheduleId?: string;
  date: string;
  status: 'ACTIVE' | 'CANCELLED' | 'MOVED';
  startTime: string;
  endTime: string;
  note?: string;
  group?: Group;
  coach?: Coach;
  location?: Location;
  dayOfWeek?: number;
  children?: Child[];
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
  type: 'NEWS' | 'EVENT' | 'VIDEO' | 'PHOTO' | 'ANNOUNCEMENT' | 'COACH_NOTE' | 'RESULT';
  visibility: 'GROUP' | 'LOCATION' | 'GLOBAL';
  mediaUrl?: string;
  isPinned: boolean;
  publishedAt: string;
  groupId?: string;
  locationId?: string;
  author?: { id: string; firstName: string; lastName?: string; role?: string };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'TRAINING_REMINDER' | 'PAYMENT' | 'ABSENCE' | 'MESSAGE' | 'ANNOUNCEMENT' | 'EVENT';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId?: string;
  groupId?: string;
  subject?: string;
  body: string;
  type: 'DIRECT' | 'GROUP' | 'ANNOUNCEMENT';
  isRead: boolean;
  createdAt: string;
  from?: User;
}

export interface DashboardData {
  nextTraining?: ScheduleItem;
  children: Child[];
  pendingPayments: Payment[];
  feedPreview: ContentPost[];
  quickActions: string[];
  todaySchedules?: ScheduleItem[];
  groups?: Group[];
  unmarkedAttendanceCount?: number;
  studentsCount?: number;
  parentsCount?: number;
  coachesCount?: number;
  groupsCount?: number;
  pendingPaymentsCount?: number;
}
