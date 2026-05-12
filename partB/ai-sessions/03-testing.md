# AI Session 03 — Unit Testing & Supertest

**Огноо:** 2026-05-03  
**Үргэлжилсэн:** ~40 мин  
**Зорилго:** Jest тест бичих, in-memory SQLite тохируулах

---

## Асуулт 1: In-memory SQLite тест дотор

**Би:** Jest тест дотор SQLite-г in-memory ашиглах аргачлал юу вэ? Production DB-г хөндөхгүй байх ёстой.

**Claude:** `DB_PATH=':memory:'` environment variable-г тест эхлэхийн өмнө тохируулах:
```javascript
process.env.DB_PATH = ':memory:';
// Дараа нь require хийх — эсвэл module cache-г цэвэрлэх
const TaskModel = require('../src/models/task.model');
```

⚠️ **Анхааруулга:** Claude `jest.resetModules()` санал болгосон ч better-sqlite3-тэй хамт module singleton pattern алдаа гаргасан. `beforeAll`-д migrate() дуудаж шийдсэн нь илүү энгийн байсан.

---

## Асуулт 2: afterEach cleanup

**Би:** Тест бүрийн дараа DB-г хэрхэн цэвэрлэх вэ?

**Claude:**
```javascript
afterEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM tasks; DELETE FROM tags;');
});
```

`TRUNCATE` биш `DELETE` ашиглах — SQLite-д TRUNCATE байхгүй. ✅

---

## Асуулт 3: Supertest integration test

**Би:** Express app-г supertest-ээр тест хийхэд server.listen() дуудах хэрэгтэй юу?

**Claude:** Үгүй — `app` объектыг шууд supertest-д дамжуулна:
```javascript
const request = require('supertest');
const app = require('../src/index');
// server.listen() дуудахгүй — supertest өөрөө handle хийнэ
const res = await request(app).get('/api/v1/tasks');
```

`require.main === module` шалгалт index.js-д заавал хийх — тест дотор `listen` дуудагдахгүй болно. ✅ **Хэрэглэсэн.**

---

## Тест coverage үр дүн

```
Test Suites: 3 passed, 3 total
Tests:       28 passed, 28 total
Coverage:    Lines: 84.2% | Branches: 71.8% | Functions: 88.9%
```

## AI-тай тестийг хэрхэн шалгасан

1. Тест нэр бүрийг ойлгосон — ямар нөхцөл шалгаж байгааг
2. Edge case-ийг өөрөө нэмсэн (AI зарим давхцал гаргасан)
3. Mock ашиглаагүй — in-memory DB нь хангалттай isolation өгсөн
