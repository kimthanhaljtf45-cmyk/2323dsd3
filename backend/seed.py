"""
Seed script for АТАКА Mini App database
Run: python seed.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'sports_miniapp')

async def seed():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Seeding database...")
    
    # Clear existing data
    collections = ['users', 'children', 'parent_children', 'groups', 'locations', 
                   'schedules', 'attendance', 'payments', 'content_posts', 'notifications', 
                   'trial_leads', 'achievements', 'bot_interactions']
    for col in collections:
        await db[col].delete_many({})
    
    # ============ REAL LOCATIONS ============
    
    # 1. Позняки
    loc_poznyaky = await db.locations.insert_one({
        "name": "Позняки",
        "address": "вул. Анни Ахматової, 13В",
        "city": "Київ",
        "district": "Дарницький",
        "lat": 50.3987,
        "lng": 30.6282,
        "description": "Зал на Позняках біля метро",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    loc_poznyaky_id = str(loc_poznyaky.inserted_id)
    
    # 2. Відрадний
    loc_vidradnyi = await db.locations.insert_one({
        "name": "Відрадний",
        "address": "вул. Новопольова, 106",
        "city": "Київ",
        "district": "Солом'янський",
        "lat": 50.4321,
        "lng": 30.4123,
        "description": "Зал у районі Відрадний",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    loc_vidradnyi_id = str(loc_vidradnyi.inserted_id)
    
    # 3. Академіка Шалімова
    loc_shalimova = await db.locations.insert_one({
        "name": "Академіка Шалімова",
        "address": "вул. Академіка Шалімова, 43",
        "city": "Київ",
        "district": "Солом'янський",
        "lat": 50.4256,
        "lng": 30.4456,
        "description": "Зал біля Інституту Шалімова",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    loc_shalimova_id = str(loc_shalimova.inserted_id)
    
    # 4. Соломʼянка
    loc_solomianka = await db.locations.insert_one({
        "name": "Соломʼянка",
        "address": "вул. Авіаконструктора Антонова, 4",
        "city": "Київ",
        "district": "Солом'янський",
        "lat": 50.4312,
        "lng": 30.4234,
        "description": "Зал на Соломʼянці",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    loc_solomianka_id = str(loc_solomianka.inserted_id)
    
    # ============ USERS ============
    
    admin_result = await db.users.insert_one({
        "telegramId": "100000001",
        "firstName": "Адміністратор",
        "lastName": "Школи",
        "username": "school_admin",
        "phone": "+380501234567",
        "role": "ADMIN",
        "status": "ACTIVE",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    admin_id = str(admin_result.inserted_id)
    
    coach1_result = await db.users.insert_one({
        "telegramId": "100000002",
        "firstName": "Олександр",
        "lastName": "Петренко",
        "username": "coach_alex",
        "phone": "+380502345678",
        "role": "COACH",
        "status": "ACTIVE",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    coach1_id = str(coach1_result.inserted_id)
    
    coach2_result = await db.users.insert_one({
        "telegramId": "100000003",
        "firstName": "Марія",
        "lastName": "Іваненко",
        "username": "coach_maria",
        "phone": "+380503456789",
        "role": "COACH",
        "status": "ACTIVE",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    coach2_id = str(coach2_result.inserted_id)
    
    parent1_result = await db.users.insert_one({
        "telegramId": "100000004",
        "firstName": "Ірина",
        "lastName": "Коваленко",
        "username": "parent_iryna",
        "phone": "+380504567890",
        "role": "PARENT",
        "status": "ACTIVE",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    parent1_id = str(parent1_result.inserted_id)
    
    parent2_result = await db.users.insert_one({
        "telegramId": "100000005",
        "firstName": "Віктор",
        "lastName": "Сидоренко",
        "username": "parent_victor",
        "phone": "+380505678901",
        "role": "PARENT",
        "status": "ACTIVE",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    parent2_id = str(parent2_result.inserted_id)
    
    # Student user
    student1_result = await db.users.insert_one({
        "telegramId": "100000010",
        "firstName": "Артем",
        "lastName": "Коваленко",
        "username": "student_artem",
        "phone": None,
        "role": "STUDENT",
        "status": "ACTIVE",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    student1_id = str(student1_result.inserted_id)
    
    # ============ GROUPS ============
    
    # Позняки groups
    group_poznyaky_1 = await db.groups.insert_one({
        "name": "Позняки 18:30",
        "ageRange": "6-12",
        "level": "Початковий",
        "capacity": 15,
        "description": "Пн Ср Пт 18:30-19:30",
        "coachId": coach1_id,
        "locationId": loc_poznyaky_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_poznyaky_1_id = str(group_poznyaky_1.inserted_id)
    
    group_poznyaky_2 = await db.groups.insert_one({
        "name": "Позняки 19:30",
        "ageRange": "12-16",
        "level": "Середній",
        "capacity": 15,
        "description": "Пн Ср Пт 19:30-20:00",
        "coachId": coach1_id,
        "locationId": loc_poznyaky_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_poznyaky_2_id = str(group_poznyaky_2.inserted_id)
    
    # Відрадний groups
    group_vidradnyi_1 = await db.groups.insert_one({
        "name": "Відрадний 15:20 (Пн Ср Пт)",
        "ageRange": "6-10",
        "level": "Початковий",
        "capacity": 15,
        "description": "Пн Ср Пт 15:20-16:20",
        "coachId": coach2_id,
        "locationId": loc_vidradnyi_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_vidradnyi_1_id = str(group_vidradnyi_1.inserted_id)
    
    group_vidradnyi_2 = await db.groups.insert_one({
        "name": "Відрадний 16:20 (Пн Ср Пт)",
        "ageRange": "10-14",
        "level": "Середній",
        "capacity": 15,
        "description": "Пн Ср Пт 16:20-17:20",
        "coachId": coach2_id,
        "locationId": loc_vidradnyi_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_vidradnyi_2_id = str(group_vidradnyi_2.inserted_id)
    
    group_vidradnyi_3 = await db.groups.insert_one({
        "name": "Відрадний 14:20 (Вт Чт)",
        "ageRange": "6-10",
        "level": "Початковий",
        "capacity": 15,
        "description": "Вт Чт 14:20-15:20",
        "coachId": coach2_id,
        "locationId": loc_vidradnyi_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_vidradnyi_3_id = str(group_vidradnyi_3.inserted_id)
    
    group_vidradnyi_4 = await db.groups.insert_one({
        "name": "Відрадний 15:20 (Вт Чт)",
        "ageRange": "10-14",
        "level": "Середній",
        "capacity": 15,
        "description": "Вт Чт 15:20-16:20",
        "coachId": coach2_id,
        "locationId": loc_vidradnyi_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_vidradnyi_4_id = str(group_vidradnyi_4.inserted_id)
    
    # Академіка Шалімова groups
    group_shalimova_1 = await db.groups.insert_one({
        "name": "Шалімова 17:00 (Вт Чт)",
        "ageRange": "6-14",
        "level": "Початковий/Середній",
        "capacity": 20,
        "description": "Вт Чт 17:00-18:30",
        "coachId": coach1_id,
        "locationId": loc_shalimova_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_shalimova_1_id = str(group_shalimova_1.inserted_id)
    
    group_shalimova_2 = await db.groups.insert_one({
        "name": "Шалімова 10:00 (Сб)",
        "ageRange": "6-14",
        "level": "Всі рівні",
        "capacity": 25,
        "description": "Сб 10:00-11:30",
        "coachId": coach1_id,
        "locationId": loc_shalimova_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_shalimova_2_id = str(group_shalimova_2.inserted_id)
    
    # Соломʼянка groups
    group_solomianka_1 = await db.groups.insert_one({
        "name": "Соломʼянка 18:30",
        "ageRange": "6-12",
        "level": "Початковий",
        "capacity": 15,
        "description": "Вт Чт 18:30-19:30",
        "coachId": coach2_id,
        "locationId": loc_solomianka_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_solomianka_1_id = str(group_solomianka_1.inserted_id)
    
    group_solomianka_2 = await db.groups.insert_one({
        "name": "Соломʼянка 19:30",
        "ageRange": "12-18",
        "level": "Середній/Просунутий",
        "capacity": 20,
        "description": "Вт Чт 19:30-21:00",
        "coachId": coach2_id,
        "locationId": loc_solomianka_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    group_solomianka_2_id = str(group_solomianka_2.inserted_id)
    
    # ============ SCHEDULES ============
    # dayOfWeek: 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб, 7=Нд
    
    schedules = [
        # Позняки - Пн Ср Пт 18:30-19:30
        {"groupId": group_poznyaky_1_id, "dayOfWeek": 1, "startTime": "18:30", "endTime": "19:30", "isActive": True},
        {"groupId": group_poznyaky_1_id, "dayOfWeek": 3, "startTime": "18:30", "endTime": "19:30", "isActive": True},
        {"groupId": group_poznyaky_1_id, "dayOfWeek": 5, "startTime": "18:30", "endTime": "19:30", "isActive": True},
        # Позняки - Пн Ср Пт 19:30-20:00
        {"groupId": group_poznyaky_2_id, "dayOfWeek": 1, "startTime": "19:30", "endTime": "20:00", "isActive": True},
        {"groupId": group_poznyaky_2_id, "dayOfWeek": 3, "startTime": "19:30", "endTime": "20:00", "isActive": True},
        {"groupId": group_poznyaky_2_id, "dayOfWeek": 5, "startTime": "19:30", "endTime": "20:00", "isActive": True},
        
        # Відрадний - Пн Ср Пт 15:20-16:20
        {"groupId": group_vidradnyi_1_id, "dayOfWeek": 1, "startTime": "15:20", "endTime": "16:20", "isActive": True},
        {"groupId": group_vidradnyi_1_id, "dayOfWeek": 3, "startTime": "15:20", "endTime": "16:20", "isActive": True},
        {"groupId": group_vidradnyi_1_id, "dayOfWeek": 5, "startTime": "15:20", "endTime": "16:20", "isActive": True},
        # Відрадний - Пн Ср Пт 16:20-17:20
        {"groupId": group_vidradnyi_2_id, "dayOfWeek": 1, "startTime": "16:20", "endTime": "17:20", "isActive": True},
        {"groupId": group_vidradnyi_2_id, "dayOfWeek": 3, "startTime": "16:20", "endTime": "17:20", "isActive": True},
        {"groupId": group_vidradnyi_2_id, "dayOfWeek": 5, "startTime": "16:20", "endTime": "17:20", "isActive": True},
        # Відрадний - Вт Чт 14:20-15:20
        {"groupId": group_vidradnyi_3_id, "dayOfWeek": 2, "startTime": "14:20", "endTime": "15:20", "isActive": True},
        {"groupId": group_vidradnyi_3_id, "dayOfWeek": 4, "startTime": "14:20", "endTime": "15:20", "isActive": True},
        # Відрадний - Вт Чт 15:20-16:20
        {"groupId": group_vidradnyi_4_id, "dayOfWeek": 2, "startTime": "15:20", "endTime": "16:20", "isActive": True},
        {"groupId": group_vidradnyi_4_id, "dayOfWeek": 4, "startTime": "15:20", "endTime": "16:20", "isActive": True},
        
        # Шалімова - Вт Чт 17:00-18:30
        {"groupId": group_shalimova_1_id, "dayOfWeek": 2, "startTime": "17:00", "endTime": "18:30", "isActive": True},
        {"groupId": group_shalimova_1_id, "dayOfWeek": 4, "startTime": "17:00", "endTime": "18:30", "isActive": True},
        # Шалімова - Сб 10:00-11:30
        {"groupId": group_shalimova_2_id, "dayOfWeek": 6, "startTime": "10:00", "endTime": "11:30", "isActive": True},
        
        # Соломʼянка - Вт Чт 18:30-19:30
        {"groupId": group_solomianka_1_id, "dayOfWeek": 2, "startTime": "18:30", "endTime": "19:30", "isActive": True},
        {"groupId": group_solomianka_1_id, "dayOfWeek": 4, "startTime": "18:30", "endTime": "19:30", "isActive": True},
        # Соломʼянка - Вт Чт 19:30-21:00
        {"groupId": group_solomianka_2_id, "dayOfWeek": 2, "startTime": "19:30", "endTime": "21:00", "isActive": True},
        {"groupId": group_solomianka_2_id, "dayOfWeek": 4, "startTime": "19:30", "endTime": "21:00", "isActive": True},
    ]
    
    for s in schedules:
        s["createdAt"] = datetime.now(timezone.utc)
        s["updatedAt"] = datetime.now(timezone.utc)
    
    await db.schedules.insert_many(schedules)
    
    # ============ CHILDREN ============
    
    child1_result = await db.children.insert_one({
        "firstName": "Артем",
        "lastName": "Коваленко",
        "birthDate": "2017-05-15",
        "status": "ACTIVE",
        "note": "Активний, любить спарінги",
        "groupId": group_poznyaky_1_id,
        "userId": student1_id,
        "telegramId": "100000010",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    child1_id = str(child1_result.inserted_id)
    
    child2_result = await db.children.insert_one({
        "firstName": "Софія",
        "lastName": "Коваленко",
        "birthDate": "2014-09-22",
        "status": "ACTIVE",
        "note": "Готується до чемпіонату",
        "groupId": group_shalimova_1_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    child2_id = str(child2_result.inserted_id)
    
    child3_result = await db.children.insert_one({
        "firstName": "Максим",
        "lastName": "Сидоренко",
        "birthDate": "2010-03-10",
        "status": "ACTIVE",
        "note": "Переможець регіональних змагань",
        "groupId": group_solomianka_2_id,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    })
    child3_id = str(child3_result.inserted_id)
    
    # Link parents to children
    await db.parent_children.insert_many([
        {"parentId": parent1_id, "childId": child1_id, "relation": "mother", "createdAt": datetime.now(timezone.utc)},
        {"parentId": parent1_id, "childId": child2_id, "relation": "mother", "createdAt": datetime.now(timezone.utc)},
        {"parentId": parent2_id, "childId": child3_id, "relation": "father", "createdAt": datetime.now(timezone.utc)},
    ])
    
    # ============ PAYMENTS ============
    
    await db.payments.insert_many([
        {
            "childId": child1_id,
            "amount": 2500,
            "currency": "UAH",
            "description": "Абонемент січень 2026",
            "status": "PENDING",
            "proofUrl": None,
            "dueDate": "2026-01-10",
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        },
        {
            "childId": child2_id,
            "amount": 3000,
            "currency": "UAH",
            "description": "Абонемент січень 2026",
            "status": "PAID",
            "paidAt": "2026-01-05T10:00:00Z",
            "approvedById": admin_id,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        },
        {
            "childId": child3_id,
            "amount": 3500,
            "currency": "UAH",
            "description": "Абонемент січень 2026",
            "status": "UNDER_REVIEW",
            "proofUrl": "https://example.com/proof.jpg",
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        },
    ])
    
    # ============ CONTENT POSTS ============
    
    await db.content_posts.insert_many([
        {
            "authorId": admin_id,
            "title": "Вітаємо у новому навчальному році!",
            "body": "Раді повідомити про початок занять у січні 2026 року. Бажаємо всім успіхів та нових досягнень!",
            "type": "ANNOUNCEMENT",
            "visibility": "GLOBAL",
            "isPinned": True,
            "publishedAt": datetime.now(timezone.utc),
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        },
        {
            "authorId": coach1_id,
            "title": "Результати з тренування",
            "body": "Чудове тренування сьогодні! Діти показали відмінну техніку.",
            "type": "NEWS",
            "visibility": "GROUP",
            "groupId": group_poznyaky_1_id,
            "publishedAt": datetime.now(timezone.utc),
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        },
        {
            "authorId": admin_id,
            "title": "Регіональний турнір 15 лютого",
            "body": "Запрошуємо всіх на регіональний турнір з тхеквондо. Реєстрація до 10 лютого.",
            "type": "EVENT",
            "visibility": "GLOBAL",
            "publishedAt": datetime.now(timezone.utc),
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        },
    ])
    
    # ============ ATTENDANCE ============
    
    await db.attendance.insert_many([
        {"childId": child1_id, "scheduleId": "s1", "date": "2026-01-02", "status": "PRESENT", "createdAt": datetime.now(timezone.utc)},
        {"childId": child1_id, "scheduleId": "s1", "date": "2026-01-04", "status": "PRESENT", "createdAt": datetime.now(timezone.utc)},
        {"childId": child1_id, "scheduleId": "s1", "date": "2026-01-06", "status": "WARNED", "reason": "Хвороба", "createdAt": datetime.now(timezone.utc)},
        {"childId": child1_id, "scheduleId": "s1", "date": "2026-01-09", "status": "PRESENT", "createdAt": datetime.now(timezone.utc)},
        {"childId": child1_id, "scheduleId": "s1", "date": "2026-01-11", "status": "PRESENT", "createdAt": datetime.now(timezone.utc)},
        {"childId": child1_id, "scheduleId": "s1", "date": "2026-01-13", "status": "PRESENT", "createdAt": datetime.now(timezone.utc)},
        {"childId": child2_id, "scheduleId": "s2", "date": "2026-01-02", "status": "PRESENT", "createdAt": datetime.now(timezone.utc)},
        {"childId": child2_id, "scheduleId": "s2", "date": "2026-01-04", "status": "PRESENT", "createdAt": datetime.now(timezone.utc)},
    ])
    
    # ============ ACHIEVEMENTS ============
    
    await db.achievements.insert_many([
        {
            "childId": child1_id,
            "title": "Перший місяць",
            "description": "Успішно завершив перший місяць тренувань",
            "type": "FIRST_MONTH",
            "awardedAt": datetime.now(timezone.utc) - timedelta(days=30),
            "createdAt": datetime.now(timezone.utc),
        },
        {
            "childId": child1_id,
            "title": "Відмінник",
            "description": "5 тренувань поспіль без пропусків",
            "type": "ATTENDANCE_STREAK",
            "awardedAt": datetime.now(timezone.utc) - timedelta(days=7),
            "createdAt": datetime.now(timezone.utc),
        },
    ])
    
    print("Seed completed!")
    print("")
    print("=== LOCATIONS ===")
    print("1. Позняки - вул. Анни Ахматової, 13В")
    print("2. Відрадний - вул. Новопольова, 106")
    print("3. Академіка Шалімова - вул. Академіка Шалімова, 43")
    print("4. Соломʼянка - вул. Авіаконструктора Антонова, 4")
    print("")
    print("=== TEST ACCOUNTS ===")
    print("- Admin: telegramId=100000001")
    print("- Coach 1: telegramId=100000002 (Олександр)")
    print("- Coach 2: telegramId=100000003 (Марія)")
    print("- Parent 1: telegramId=100000004 (Ірина, 2 дитини)")
    print("- Parent 2: telegramId=100000005 (Віктор, 1 дитина)")
    print("- Student: telegramId=100000010 (Артем)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
