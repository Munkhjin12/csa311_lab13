/**
 * Tag Model — SQLite queries
 */
const { getDb } = require('../db/connection');

function findAll() {
  const db = getDb();
  return db.prepare('SELECT * FROM tags ORDER BY name').all();
}

function findById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id) || null;
}

function create({ name, color = '#6366f1' }) {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO tags (name, color) VALUES (?, ?)'
  ).run(name.trim(), color);
  return findById(result.lastInsertRowid);
}

function remove(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Task-д tag нэмэх
 */
function addToTask(taskId, tagId) {
  const db = getDb();
  try {
    db.prepare(
      'INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)'
    ).run(taskId, tagId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Task-аас tag хасах
 */
function removeFromTask(taskId, tagId) {
  const db = getDb();
  const result = db.prepare(
    'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?'
  ).run(taskId, tagId);
  return result.changes > 0;
}

module.exports = { findAll, findById, create, remove, addToTask, removeFromTask };
