# Personal Task Tracker — API

F.CSM311 Бие даалт 13 — Б хэсэг (Build)

## Технологи

| Давхарга | Технологи |
|---------|-----------|
| Runtime | Node.js 20 LTS |
| Framework | Express 4 |
| Database | SQLite3 (better-sqlite3) |
| Validation | express-validator |
| Testing | Jest + Supertest |
| API Docs | OpenAPI 3.0 |

## Суулгах

```bash
# 1. Node.js 20 суулгасан байх
node --version  # v20.x.x

# 2. Хамааралтай сангууд суулгах
npm install

# 3. Environment тохируулах
cp .env.example .env

# 4. Database үүсгэх
npm run migrate

# 5. (Optional) Туршилтын өгөгдөл
npm run seed
```

## Ажиллуулах

```bash
# Development (auto-reload)
npm run dev

# Production
npm start

# Server: http://localhost:3000
# API:    http://localhost:3000/api/v1
```

## Тест

```bash
# Бүх тест
npm test

# Coverage тайлан
npm test -- --coverage

# Watch mode
npm run test:watch
```

## API Endpoint-үүд

### Tasks

| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | `/api/v1/tasks` | Бүх даалгавар (filter, search, pagination) |
| GET | `/api/v1/tasks/overdue` | Хоцорсон даалгаврууд |
| GET | `/api/v1/tasks/:id` | Нэг даалгавар |
| POST | `/api/v1/tasks` | Шинэ даалгавар |
| PUT | `/api/v1/tasks/:id` | Даалгавар засах |
| DELETE | `/api/v1/tasks/:id` | Даалгавар устгах |
| POST | `/api/v1/tasks/:id/tags/:tagId` | Tag нэмэх |

### Tags

| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | `/api/v1/tags` | Бүх tag |
| POST | `/api/v1/tags` | Шинэ tag |
| DELETE | `/api/v1/tags/:id` | Tag устгах |

### Query Parameters (GET /tasks)

```
?status=pending           # pending | in-progress | done
?priority=high            # low | medium | high
?search=даалгавар         # гарчиг, тайлбараар хайх
?page=1&limit=20          # pagination
```

## Жишээ хүсэлт

```bash
# Шинэ даалгавар үүсгэх
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Тест даалгавар","priority":"high","due_date":"2025-05-01"}'

# Бүх даалгавар авах
curl http://localhost:3000/api/v1/tasks

# Хоцорсон даалгаврууд
curl http://localhost:3000/api/v1/tasks/overdue

# Статусаар шүүх
curl "http://localhost:3000/api/v1/tasks?status=pending&priority=high"
```

## Директор бүтэц

```
partB/
├── src/
│   ├── index.js              # Express app
│   ├── db/
│   │   ├── schema.sql        # DB бүтэц
│   │   ├── connection.js     # SQLite холболт
│   │   ├── migrate.js        # Migration
│   │   └── seed.js           # Туршилтын өгөгдөл
│   ├── routes/
│   │   ├── tasks.js          # /api/v1/tasks
│   │   └── tags.js           # /api/v1/tags
│   ├── models/
│   │   ├── task.model.js     # Task CRUD
│   │   └── tag.model.js      # Tag CRUD
│   ├── services/
│   │   └── task.service.js   # Business logic
│   └── middleware/
│       ├── validate.js       # Input validation
│       └── errorHandler.js   # Error handling
├── tests/
│   ├── task.model.test.js    # Model unit tests
│   ├── task.routes.test.js   # Route integration tests
│   └── task.service.test.js  # Service unit tests
├── public/
│   └── index.html            # Frontend
├── openapi.yaml              # API spec
└── package.json
```

## Feature-үүд

1. **Task CRUD** — Үүсгэх, харах, засах, устгах
2. **Priority & Status** — low/medium/high, pending/in-progress/done
3. **Due Date & Overdue** — Хугацаа тохируулах, хоцорсон тэмдэглэх
4. **Tag System** — Шошго нэмэх, засах
5. **Search & Filter** — Нэрээр хайх, статус/тэргүүлэх чиглэлээр шүүх
