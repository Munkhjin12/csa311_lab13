-- Personal Task Tracker — Database Schema
-- SQLite3

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL CHECK(length(title) >= 1 AND length(title) <= 200),
  description TEXT    DEFAULT '',
  status      TEXT    NOT NULL DEFAULT 'pending'
                      CHECK(status IN ('pending', 'in-progress', 'done')),
  priority    TEXT    NOT NULL DEFAULT 'medium'
                      CHECK(priority IN ('low', 'medium', 'high')),
  due_date    TEXT    DEFAULT NULL,  -- ISO 8601: YYYY-MM-DD
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE CHECK(length(name) >= 1 AND length(name) <= 50),
  color TEXT NOT NULL DEFAULT '#6366f1'  -- hex color
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
