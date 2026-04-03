import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'sports_miniapp';

  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);

  console.log('Seeding database...');

  // Clear existing data
  await db.collection('users').deleteMany({});
  await db.collection('children').deleteMany({});
  await db.collection('parent_children').deleteMany({});
  await db.collection('groups').deleteMany({});
  await db.collection('locations').deleteMany({});
  await db.collection('schedules').deleteMany({});
  await db.collection('attendance').deleteMany({});
  await db.collection('payments').deleteMany({});
  await db.collection('content_posts').deleteMany({});
  await db.collection('notifications').deleteMany({});

  // Create locations
  const location1 = await db.collection('locations').insertOne({
    name: 'Зал Оболонь',
    address: 'вул. Героїв Дніпра, 15',
    city: 'Київ',
    lat: 50.5010,
    lng: 30.4980,
    description: 'Сучасний зал для єдиноборств з професійним покриттям',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const location2 = await db.collection('locations').insertOne({
    name: 'Зал Позняки',
    address: 'вул. Драгоманова, 23',
    city: 'Київ',
    lat: 50.4020,
    lng: 30.6280,
    description: 'Просторий зал у ЖК з паркінгом',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create users
  const admin = await db.collection('users').insertOne({
    telegramId: '100000001',
    firstName: 'Адміністратор',
    lastName: 'Школи',
    username: 'school_admin',
    phone: '+380501234567',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const coach1 = await db.collection('users').insertOne({
    telegramId: '100000002',
    firstName: 'Олександр',
    lastName: 'Петренко',
    username: 'coach_alex',
    phone: '+380502345678',
    role: 'COACH',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const coach2 = await db.collection('users').insertOne({
    telegramId: '100000003',
    firstName: 'Марія',
    lastName: 'Іваненко',
    username: 'coach_maria',
    phone: '+380503456789',
    role: 'COACH',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const parent1 = await db.collection('users').insertOne({
    telegramId: '100000004',
    firstName: 'Ірина',
    lastName: 'Коваленко',
    username: 'parent_iryna',
    phone: '+380504567890',
    role: 'PARENT',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const parent2 = await db.collection('users').insertOne({
    telegramId: '100000005',
    firstName: 'Віктор',
    lastName: 'Сидоренко',
    username: 'parent_victor',
    phone: '+380505678901',
    role: 'PARENT',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create groups
  const group1 = await db.collection('groups').insertOne({
    name: 'Діти 6-8 років (початківці)',
    ageRange: '6-8',
    level: 'Початковий',
    capacity: 15,
    description: 'Група для найменших. Основи тхеквондо в ігровій формі.',
    coachId: coach1.insertedId.toString(),
    locationId: location1.insertedId.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const group2 = await db.collection('groups').insertOne({
    name: 'Діти 9-12 років (середній)',
    ageRange: '9-12',
    level: 'Середній',
    capacity: 20,
    description: 'Розвиток техніки та підготовка до змагань.',
    coachId: coach1.insertedId.toString(),
    locationId: location1.insertedId.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const group3 = await db.collection('groups').insertOne({
    name: 'Підлітки 13-16 років',
    ageRange: '13-16',
    level: 'Просунутий',
    capacity: 18,
    description: 'Спортивна підготовка та участь у турнірах.',
    coachId: coach2.insertedId.toString(),
    locationId: location2.insertedId.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create children
  const child1 = await db.collection('children').insertOne({
    firstName: 'Артем',
    lastName: 'Коваленко',
    birthDate: new Date('2017-05-15'),
    status: 'ACTIVE',
    note: 'Активний, любить спарінги',
    groupId: group1.insertedId.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const child2 = await db.collection('children').insertOne({
    firstName: 'Софія',
    lastName: 'Коваленко',
    birthDate: new Date('2014-09-22'),
    status: 'ACTIVE',
    note: 'Готується до чемпіонату',
    groupId: group2.insertedId.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const child3 = await db.collection('children').insertOne({
    firstName: 'Максим',
    lastName: 'Сидоренко',
    birthDate: new Date('2010-03-10'),
    status: 'ACTIVE',
    note: 'Переможець регіональних змагань',
    groupId: group3.insertedId.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Link parents to children
  await db.collection('parent_children').insertOne({
    parentId: parent1.insertedId.toString(),
    childId: child1.insertedId.toString(),
    relation: 'mother',
    createdAt: new Date(),
  });

  await db.collection('parent_children').insertOne({
    parentId: parent1.insertedId.toString(),
    childId: child2.insertedId.toString(),
    relation: 'mother',
    createdAt: new Date(),
  });

  await db.collection('parent_children').insertOne({
    parentId: parent2.insertedId.toString(),
    childId: child3.insertedId.toString(),
    relation: 'father',
    createdAt: new Date(),
  });

  // Create schedules
  await db.collection('schedules').insertMany([
    {
      groupId: group1.insertedId.toString(),
      dayOfWeek: 2, // Tuesday
      startTime: '17:00',
      endTime: '18:00',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      groupId: group1.insertedId.toString(),
      dayOfWeek: 4, // Thursday
      startTime: '17:00',
      endTime: '18:00',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      groupId: group1.insertedId.toString(),
      dayOfWeek: 6, // Saturday
      startTime: '10:00',
      endTime: '11:00',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      groupId: group2.insertedId.toString(),
      dayOfWeek: 2, // Tuesday
      startTime: '18:30',
      endTime: '19:30',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      groupId: group2.insertedId.toString(),
      dayOfWeek: 4, // Thursday
      startTime: '18:30',
      endTime: '19:30',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      groupId: group3.insertedId.toString(),
      dayOfWeek: 1, // Monday
      startTime: '19:00',
      endTime: '20:30',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      groupId: group3.insertedId.toString(),
      dayOfWeek: 3, // Wednesday
      startTime: '19:00',
      endTime: '20:30',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      groupId: group3.insertedId.toString(),
      dayOfWeek: 5, // Friday
      startTime: '19:00',
      endTime: '20:30',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create payments
  await db.collection('payments').insertMany([
    {
      childId: child1.insertedId.toString(),
      amount: 2500,
      currency: 'UAH',
      description: 'Абонемент січень 2026',
      status: 'PENDING',
      proofUrl: null,
      dueDate: new Date('2026-01-10'),
      paidAt: null,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      childId: child2.insertedId.toString(),
      amount: 3000,
      currency: 'UAH',
      description: 'Абонемент січень 2026',
      status: 'PAID',
      proofUrl: null,
      dueDate: new Date('2026-01-10'),
      paidAt: new Date('2026-01-05'),
      approvedById: admin.insertedId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      childId: child3.insertedId.toString(),
      amount: 3500,
      currency: 'UAH',
      description: 'Абонемент січень 2026',
      status: 'UNDER_REVIEW',
      proofUrl: 'https://example.com/proof.jpg',
      dueDate: new Date('2026-01-10'),
      paidAt: null,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Create content posts
  await db.collection('content_posts').insertMany([
    {
      authorId: admin.insertedId.toString(),
      title: 'Вітаємо у новому навчальному році!',
      body: 'Раді повідомити про початок занять у січні 2026 року. Бажаємо всім успіхів та нових досягнень!',
      type: 'ANNOUNCEMENT',
      visibility: 'GLOBAL',
      mediaUrl: null,
      isPinned: true,
      groupId: null,
      locationId: null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      authorId: coach1.insertedId.toString(),
      title: 'Результати з тренування',
      body: 'Чудове тренування сьогодні! Діти показали відмінну техніку.',
      type: 'NEWS',
      visibility: 'GROUP',
      mediaUrl: 'https://images.unsplash.com/photo-1769095207072-0c84d9b7b9ee',
      isPinned: false,
      groupId: group1.insertedId.toString(),
      locationId: null,
      publishedAt: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      authorId: admin.insertedId.toString(),
      title: 'Регіональний турнір 15 лютого',
      body: 'Запрошуємо всіх на регіональний турнір з тхеквондо. Реєстрація до 10 лютого.',
      type: 'EVENT',
      visibility: 'GLOBAL',
      mediaUrl: null,
      isPinned: false,
      groupId: null,
      locationId: null,
      publishedAt: new Date(Date.now() - 172800000),
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
    },
  ]);

  console.log('Seed completed!');
  console.log('');
  console.log('Test accounts:');
  console.log('- Admin: telegramId=100000001');
  console.log('- Coach 1: telegramId=100000002');
  console.log('- Coach 2: telegramId=100000003');
  console.log('- Parent 1 (2 children): telegramId=100000004');
  console.log('- Parent 2 (1 child): telegramId=100000005');

  await client.close();
};

seed().catch(console.error);
