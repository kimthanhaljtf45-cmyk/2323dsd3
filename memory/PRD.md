# АТАКА - Telegram Mini App

## Опис
Telegram Mini App для школи єдиноборств "АТАКА - Team Kostenko". Платформа для батьків, учнів, тренерів та адміністраторів для керування тренуваннями, відвідуваністю, оплатами та комунікацією.

## Tech Stack
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS + Zustand
- **Backend**: FastAPI + MongoDB (Motor) + PyJWT
- **Routing**: Next.js App Router (file-based)

## Реалізовані функції (✅ MVP)

### Етап 1 - App Shell + Home + Profile (ЗАВЕРШЕНО)
- ✅ **Fixed App Shell** - фіксований header та bottom navigation
- ✅ **Deep Profile** для батька:
  - Hero блок з аватаром, ім'ям, роллю, статистикою
  - "Моя родина в клубі" - список дітей
  - "Моя активність" - тренування та попередження
  - "Оплати" - неоплачені рахунки та історія
  - "Повідомлення" - комунікація з тренером
  - "Рейтинг і успішність"
  - "Налаштування" - особисті дані, сповіщення, допомога
- ✅ **Deep Home** для батька:
  - Привітання з датою
  - Картка наступного тренування з CTA
  - Попередження про неоплачені рахунки
  - "Мої діти" з attendance та progress
  - "Швидкі дії" - розклад, оплати, пропуск, написати
  - "Прогрес цього місяця" - прогрес бар по дітях
  - "Життя клубу" - preview feed
- ✅ **Deep Child Card**:
  - Hero з ім'ям, групою, тренером, локацією
  - Quick stats: дисципліна %, тренувань, досягнень
  - Картка наступного тренування
  - Детальна дисципліна (був/попередив/пропустив)
  - Ціль місяця з прогрес баром
  - Коментар тренера
  - Досягнення
  - Рейтинг
  - Історія тренувань
  - Оплати
- ✅ **Schedule** - розклад тренувань з групуванням по датах
- ✅ **Feed** - стрічка новин з фільтрами (Усі/Новини/Події)

### Ролі користувачів
- ✅ PARENT (Батько)
- ✅ STUDENT (Учень) - базова Home
- ✅ COACH (Тренер) - базова Home
- ✅ ADMIN (Адмін) - базова Home

## Backlog

### P0 (Критичні)
- [ ] Telegram WebApp повна інтеграція (initData auth)
- [ ] Форма вибору ролі при реєстрації

### P1 (Важливі)
- [ ] UI для батька: додавання/керування дітьми
- [ ] Admin: призначення ролі тренера
- [ ] Absence flow - повідомлення про пропуск
- [ ] Messages - комунікація тренер ↔ батьки
- [ ] Notifications - сповіщення

### P2 (Бажані)
- [ ] Ratings - рейтинг дисципліни/групи/клубу
- [ ] Tournaments - турніри
- [ ] Rich Feed - фото/відео контент
- [ ] Coach dashboard - attendance marking
- [ ] Payment flow - підтвердження оплати

## API Endpoints

### Auth
- `POST /api/auth/mock` - демо логін
- `POST /api/auth/telegram` - Telegram WebApp авторизація

### Users
- `GET /api/users/me` - поточний користувач
- `GET /api/users/me/dashboard` - dashboard data

### Children
- `GET /api/children` - діти батька
- `GET /api/children/{id}` - одна дитина
- `POST /api/children` - додати дитину

### Schedule
- `GET /api/schedule` - розклад тренувань

### Content
- `GET /api/content` - стрічка постів

### Payments
- `GET /api/payments` - оплати батька

### Attendance
- `GET /api/attendance/child/{childId}` - відвідуваність дитини

## Тестові акаунти

| Роль | Telegram ID | Ім'я |
|------|-------------|------|
| PARENT | 100000004 | Ірина |
| STUDENT | 100000010 | Артем |
| COACH | 100000002 | Олександр |
| ADMIN | 100000001 | Адміністратор |

## Запуск

```bash
# Backend
cd backend && pip install -r requirements.txt
python seed.py  # Наповнити базу тестовими даними
uvicorn server:app --reload --port 8001

# Frontend
cd frontend && yarn install
yarn dev  # Development
yarn build && yarn start  # Production
```

## Структура файлів

```
/app
├── backend/
│   ├── server.py       # FastAPI routes
│   ├── seed.py         # Database seeding
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/        # Next.js pages
│   │   ├── components/ # React components
│   │   ├── store/      # Zustand store
│   │   ├── lib/        # API client
│   │   └── types/      # TypeScript types
│   └── package.json
└── memory/
    └── PRD.md          # This file
```
