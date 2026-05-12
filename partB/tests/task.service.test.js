/**
 * Task Service — Unit Tests
 */
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:'; // require-уудаас өмнө байх ёстой

const { getDb } = require('../src/db/connection');
const path = require('path');
const fs = require('fs');
const SCHEMA_PATH = path.join(__dirname, '../src/db/schema.sql');

// Migration-ыг require-уудын дараа шууд ажиллуулж Memory DB-г бэлдэнэ
const db = getDb();
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

const TaskService = require('../src/services/task.service');

afterEach(() => {
  // getDb() нь migrate-ын үүсгэсэн нэг ижил memory instance-ийг өгнө
  getDb().exec('DELETE FROM task_tags; DELETE FROM tasks;');
});

describe('TaskService.createTask()', () => {
  it('should create and return task', () => {
    const task = TaskService.createTask({ title: 'Service тест' });
    expect(task.title).toBe('Service тест');
    expect(task.id).toBeDefined();
  });
});

// ... бусад тестүүд хэвээрээ