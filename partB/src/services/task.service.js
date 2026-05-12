/**
 * Task Service — Бизнесийн логик
 * Model-ийг шууд ашиглахгүй — энэ давхаргаар дамжна
 */
const TaskModel = require('../models/task.model');
const TagModel = require('../models/tag.model');

/**
 * Даалгавар жагсаалт авах (pagination, filter)
 */
function getTasks(opts = {}) {
  const page = Math.max(1, parseInt(opts.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(opts.limit) || 20));

  const tasks = TaskModel.findAll({ ...opts, page, limit });
  const total = TaskModel.count(opts);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Нэг даалгавар авах
 * @throws {Error} 404 хэрэв олдохгүй
 */
function getTaskById(id) {
  const task = TaskModel.findById(Number(id));
  if (!task) {
    const err = new Error('Даалгавар олдсонгүй');
    err.statusCode = 404;
    throw err;
  }
  return task;
}

/**
 * Шинэ даалгавар үүсгэх
 */
function createTask(data) {
  return TaskModel.create(data);
}

/**
 * Даалгавар засах
 * @throws {Error} 404 хэрэв олдохгүй
 */
function updateTask(id, data) {
  getTaskById(id); // 404 шалгалт
  return TaskModel.update(Number(id), data);
}

/**
 * Даалгавар устгах
 * @throws {Error} 404 хэрэв олдохгүй
 */
function deleteTask(id) {
  getTaskById(id); // 404 шалгалт
  return TaskModel.remove(Number(id));
}

/**
 * Task-д tag нэмэх
 */
function addTagToTask(taskId, tagId) {
  getTaskById(taskId);
  const tag = TagModel.findById(tagId);
  if (!tag) {
    const err = new Error('Tag олдсонгүй');
    err.statusCode = 404;
    throw err;
  }
  TagModel.addToTask(taskId, tagId);
  return getTaskById(taskId);
}

/**
 * Хоцорсон даалгаврыг шалгах
 * @returns {Task[]} due_date нь өнөөдрөөс өмнө, status нь done биш
 */
function getOverdueTasks() {
  const today = new Date().toISOString().split('T')[0];
  const all = TaskModel.findAll({ limit: 1000 });
  return all.filter(
    t => t.due_date && t.due_date < today && t.status !== 'done'
  );
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTagToTask,
  getOverdueTasks,
};
