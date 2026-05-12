# AI Session 01 — Task Model & Database Design

**Огноо:** 2026-05-01 
**Үргэлжилсэн:** ~45 мин  
**Зорилго:** SQLite schema, Task model CRUD функцүүд

---

## Асуулт 1: Schema дизайн

**Би:** Task tracker-д SQLite schema хэрхэн зохион байгуулах вэ? Priority, status, due_date, tag-тай байх ёстой.

**Claude:** Many-to-many relationship-д task_tags junction table ашигла. SQLite-д `CHECK` constraint-аар enum simulate хийнэ:
```sql
status TEXT CHECK(status IN ('pending', 'in-progress', 'done'))
```

⚠️ **Hallucination шалгалт:** Claude анхлан `ENUM` type санал болгосон — SQLite-д `ENUM` байхгүй. `TEXT + CHECK` болгон засав. Энэ нь PostgreSQL syntax байсан.

---

## Асуулт 2: Prepared Statement

**Би:** findAll()-д dynamic WHERE clause хэрхэн бий болгох вэ? Filter олон байж болно.

**Claude:** Conditions array + params array pattern ашигла:
```javascript
const conditions = [];
const params = [];
if (status) { conditions.push('status = ?'); params.push(status); }
const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
db.prepare(`SELECT * FROM tasks ${where} LIMIT ?`).all(...params, limit);
```

✅ **Зөв:** String concatenation биш — SQL injection аюулгүй. Reviewed and adopted.

---

## Асуулт 3: Pagination

**Би:** SQLite-д pagination-г хэрхэн хийх вэ?

**Claude:** `LIMIT ? OFFSET ?` pattern. OFFSET = (page - 1) * limit. Count query тусдаа явуулах шаардлагатай.

✅ **Хэрэглэсэн:** task.model.js-д findAll() болон count() хоёр функц тусдаа.

---

## Хэмнэсэн цаг

| Ажил | AI-гүй | AI-тай |
|------|--------|--------|
| Schema дизайн | 1 цаг | 15 мин |
| Dynamic WHERE | 30 мин | 5 мин |
| **Нийт** | **~1.5 цаг** | **~20 мин** |
