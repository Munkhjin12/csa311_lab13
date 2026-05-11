/**
 * Task Model — SQLite CRUD queries
 * Бизнесийн логик энд байхгүй — зөвхөн DB операци
 */
const { getDb } = require('../db/connection');

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {'pending'|'in-progress'|'done'} status
 * @property {'low'|'medium'|'high'} priority
 * @property {string|null} due_date
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * Бүх даалгавар авах (filter-тэй)
 * @param {{status?, priority?, search?, page?, limit?}} opts
 * @returns {Task[]}
 */
function findAll({ status, priority, search, page = 1, limit = 20 } = {}) {
  const db = getDb();
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }
  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }
  if (search) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const rows = db.prepare(`
    SELECT t.*, GROUP_CONCAT(tg.name) AS tags
    FROM tasks t
    LEFT JOIN task_tags tt ON t.id = tt.task_id
    LEFT JOIN tags tg ON tt.tag_id = tg.id
    ${where}
    GROUP BY t.id
    ORDER BY
      CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      t.due_date ASC NULLS LAST
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return rows.map(parseTaskRow);
}

/**
 * ID-аар нэг даалгавар авах
 * @param {number} id
 * @returns {Task|null}
 */
function findById(id) {
  const db = getDb();
  const row = db.prepare(`
    SELECT t.*, GROUP_CONCAT(tg.name) AS tags
    FROM tasks t
    LEFT JOIN task_tags tt ON t.id = tt.task_id
    LEFT JOIN tags tg ON tt.tag_id = tg.id
    WHERE t.id = ?
    GROUP BY t.id
  `).get(id);

  return row ? parseTaskRow(row) : null;
}

/**
 * Шинэ даалгавар үүсгэх
 * @param {{title, description?, status?, priority?, due_date?}} data
 * @returns {Task}
 */
function create({ title, description = '', status = 'pending', priority = 'medium', due_date = null }) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date)
    VALUES (?, ?, ?, ?, ?)
  `).run(title, description, status, priority, due_date);

  return findById(result.lastInsertRowid);
}

/**
 * Даалгавар засах
 * @param {number} id
 * @param {Partial<Task>} data
 * @returns {Task|null}
 */
function update(id, data) {
  const db = getDb();
  const allowed = ['title', 'description', 'status', 'priority', 'due_date'];
  const fields = Object.keys(data).filter(k => allowed.includes(k));

  if (fields.length === 0) return findById(id);

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => data[f]);

  db.prepare(`
    UPDATE tasks
    SET ${setClause}, updated_at = datetime('now')
    WHERE id = ?
  `).run(...values, id);

  return findById(id);
}

/**
 * Даалгавар устгах
 * @param {number} id
 * @returns {boolean}
 */
function remove(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Нийт тоо авах (pagination-д)
 * @param {{status?, priority?, search?}} opts
 * @returns {number}
 */
function count({ status, priority, search } = {}) {
  const db = getDb();
  const conditions = [];
  const params = [];

  if (status) { conditions.push('status = ?'); params.push(status); }
  if (priority) { conditions.push('priority = ?'); params.push(priority); }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const row = db.prepare(`SELECT COUNT(*) as total FROM tasks ${where}`).get(...params);
  return row.total;
}

// Helper: tags string → array
function parseTaskRow(row) {
  return {
    ...row,
    tags: row.tags ? row.tags.split(',') : [],
  };
}

module.exports = { findAll, findById, create, update, remove, count };
