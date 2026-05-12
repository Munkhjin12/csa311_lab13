/**
 * Task Routes — Integration Tests
 * Supertest ашиглан HTTP endpoint тест хийнэ
 */

// 1. Тохиргоог хамгийн түрүүнд хийнэ
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:'; 

// 2. DB болон Migration-ыг эхлээд require хийнэ
const { getDb } = require('../src/db/connection');
const path = require('path');
const fs = require('fs');
const SCHEMA_PATH = path.join(__dirname, '../src/db/schema.sql');

// 3. АПП-ыг ачаалахаас ӨМНӨ хүснэгтүүдийг үүсгэнэ
// Ингэснээр app-ийн ашиглах memory DB нь хоосон биш, бүтэцтэй байна
const db = getDb();
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// 4. Одоо апп болон бусад санг require хийж болно
const request = require('supertest');
const app = require('../src/index'); 

afterEach(() => {
  // Тест бүрийн дараа өгөгдлөө цэвэрлэх (хүснэгтийг устгахгүй, зөвхөн датаг)
  const db = getDb();
  db.exec('DELETE FROM task_tags; DELETE FROM tasks;');
});

describe('POST /api/v1/tasks', () => {
  it('should create task with valid data → 201', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Шинэ даалгавар', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Шинэ даалгавар');
    expect(res.body.data.id).toBeGreaterThan(0);
  });

  it('should reject empty title → 400', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid status → 400', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Test', status: 'invalid-status' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/tasks', () => {
  beforeEach(async () => {
    // Дата бэлдэх
    await request(app).post('/api/v1/tasks').send({ title: 'Нэг', status: 'pending', priority: 'high' });
    await request(app).post('/api/v1/tasks').send({ title: 'Хоёр', status: 'done', priority: 'low' });
  });

  it('should return all tasks → 200', async () => {
    const res = await request(app).get('/api/v1/tasks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.tasks.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter by status', async () => {
    const res = await request(app).get('/api/v1/tasks?status=done');
    expect(res.status).toBe(200);
    expect(res.body.tasks.every(t => t.status === 'done')).toBe(true);
  });

  it('should return pagination info', async () => {
    const res = await request(app).get('/api/v1/tasks?page=1&limit=10');
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });
});

describe('GET /api/v1/tasks/:id', () => {
  it('should return task by id → 200', async () => {
    const create = await request(app).post('/api/v1/tasks').send({ title: 'Нэг даалгавар' });
    const id = create.body.data.id;

    const res = await request(app).get(`/api/v1/tasks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('should return 404 for unknown id', async () => {
    const res = await request(app).get('/api/v1/tasks/99999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/v1/tasks/:id', () => {
  it('should update task → 200', async () => {
    const create = await request(app).post('/api/v1/tasks').send({ title: 'Эх', status: 'pending' });
    const id = create.body.data.id;

    const res = await request(app).put(`/api/v1/tasks/${id}`).send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('done');
  });
});

describe('DELETE /api/v1/tasks/:id', () => {
  it('should delete task → 200', async () => {
    const create = await request(app).post('/api/v1/tasks').send({ title: 'Устгах' });
    const id = create.body.data.id;

    const res = await request(app).delete(`/api/v1/tasks/${id}`);
    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/v1/tasks/${id}`);
    expect(check.status).toBe(404);
  });
});

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});