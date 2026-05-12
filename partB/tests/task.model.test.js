/**
 * Task Model — Unit Tests
 * Jest + better-sqlite3 (in-memory DB)
 */
const path = require('path');

// Test DB — in-memory
process.env.DB_PATH = ':memory:';

const { getDb } = require('../src/db/connection');
const TaskModel = require('../src/models/task.model');

// Migration-г тест DB дээр ажиллуулах
const Database = require('better-sqlite3');
const fs = require('fs');
const SCHEMA_PATH = path.join(__dirname, '../src/db/schema.sql');

beforeAll(() => {
  const db = getDb(); // Тест DB connection авах
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema); // Миграцийг тест DB дээр ажиллуулах
});

afterEach(() => {
  // Тест бүрийн дараа цэвэрлэх
  const { getDb } = require('../src/db/connection');
  getDb().exec('DELETE FROM task_tags; DELETE FROM tasks;');
});

describe('TaskModel.create()', () => {
  it('should create a task with required fields only', () => {
    const task = TaskModel.create({ title: 'Тест даалгавар' });
    expect(task).toBeDefined();
    expect(task.id).toBeGreaterThan(0);
    expect(task.title).toBe('Тест даалгавар');
    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
    expect(task.due_date).toBeNull();
  });

  it('should create a task with all fields', () => {
    const task = TaskModel.create({
      title: 'Бүрэн даалгавар',
      description: 'Тайлбар текст',
      status: 'in-progress',
      priority: 'high',
      due_date: '2025-12-31',
    });
    expect(task.title).toBe('Бүрэн даалгавар');
    expect(task.status).toBe('in-progress');
    expect(task.priority).toBe('high');
    expect(task.due_date).toBe('2025-12-31');
  });

  it('should return tags as empty array by default', () => {
    const task = TaskModel.create({ title: 'Tag-гүй' });
    expect(Array.isArray(task.tags)).toBe(true);
    expect(task.tags).toHaveLength(0);
  });
});

describe('TaskModel.findById()', () => {
  it('should return task by valid id', () => {
    const created = TaskModel.create({ title: 'Хайх даалгавар' });
    const found = TaskModel.findById(created.id);
    expect(found).not.toBeNull();
    expect(found.id).toBe(created.id);
    expect(found.title).toBe('Хайх даалгавар');
  });

  it('should return null for non-existent id', () => {
    const found = TaskModel.findById(99999);
    expect(found).toBeNull();
  });
});

describe('TaskModel.findAll()', () => {
  beforeEach(() => {
    TaskModel.create({ title: 'Нэг', status: 'pending', priority: 'high' });
    TaskModel.create({ title: 'Хоёр', status: 'done', priority: 'low' });
    TaskModel.create({ title: 'Гурав', status: 'pending', priority: 'medium' });
  });

  it('should return all tasks without filter', () => {
    const tasks = TaskModel.findAll();
    expect(tasks.length).toBeGreaterThanOrEqual(3);
  });

  it('should filter by status', () => {
    const tasks = TaskModel.findAll({ status: 'pending' });
    expect(tasks.every(t => t.status === 'pending')).toBe(true);
  });

  it('should filter by priority', () => {
    const tasks = TaskModel.findAll({ priority: 'high' });
    expect(tasks.every(t => t.priority === 'high')).toBe(true);
  });

  it('should search by title', () => {
    const tasks = TaskModel.findAll({ search: 'Хоёр' });
    expect(tasks.some(t => t.title === 'Хоёр')).toBe(true);
  });

  it('should paginate correctly', () => {
    const page1 = TaskModel.findAll({ page: 1, limit: 2 });
    const page2 = TaskModel.findAll({ page: 2, limit: 2 });
    expect(page1.length).toBeLessThanOrEqual(2);
    // page1 болон page2 дахь id-ууд давхцахгүй
    const ids1 = page1.map(t => t.id);
    const ids2 = page2.map(t => t.id);
    expect(ids1.some(id => ids2.includes(id))).toBe(false);
  });
});

describe('TaskModel.update()', () => {
  it('should update specified fields only', () => {
    const task = TaskModel.create({ title: 'Эх', status: 'pending' });
    const updated = TaskModel.update(task.id, { status: 'done' });
    expect(updated.status).toBe('done');
    expect(updated.title).toBe('Эх'); // өөрчлөгдөөгүй
  });

  it('should update multiple fields', () => {
    const task = TaskModel.create({ title: 'Засах', priority: 'low' });
    const updated = TaskModel.update(task.id, { title: 'Засагдсан', priority: 'high' });
    expect(updated.title).toBe('Засагдсан');
    expect(updated.priority).toBe('high');
  });
});

describe('TaskModel.remove()', () => {
  it('should delete existing task and return true', () => {
    const task = TaskModel.create({ title: 'Устгах' });
    const result = TaskModel.remove(task.id);
    expect(result).toBe(true);
    expect(TaskModel.findById(task.id)).toBeNull();
  });

  it('should return false for non-existent id', () => {
    const result = TaskModel.remove(99999);
    expect(result).toBe(false);
  });
});

describe('TaskModel.count()', () => {
  it('should return correct total count', () => {
    TaskModel.create({ title: 'А' });
    TaskModel.create({ title: 'Б' });
    const total = TaskModel.count();
    expect(total).toBeGreaterThanOrEqual(2);
  });

  it('should count with filter', () => {
    TaskModel.create({ title: 'Дуусгах', status: 'done' });
    const doneCount = TaskModel.count({ status: 'done' });
    expect(doneCount).toBeGreaterThanOrEqual(1);
  });
});
