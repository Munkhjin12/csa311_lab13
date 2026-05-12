/**
 * Tasks Router — /api/v1/tasks
 */
const express = require('express');
const router = express.Router();
const TaskService = require('../services/task.service');
const {
  validate,
  createTaskRules,
  updateTaskRules,
  idParamRules,
  filterRules,
} = require('../middleware/validate');

/**
 * GET /api/v1/tasks
 * Бүх даалгавар авах (filter, search, pagination)
 */
router.get('/', filterRules, validate, async (req, res, next) => {
  try {
    const { status, priority, search, page, limit } = req.query;
    const result = TaskService.getTasks({ status, priority, search, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/tasks/overdue
 * Хоцорсон даалгаврууд
 */
router.get('/overdue', async (req, res, next) => {
  try {
    const tasks = TaskService.getOverdueTasks();
    res.json({ success: true, data: tasks, count: tasks.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/tasks/:id
 * Нэг даалгавар авах
 */
router.get('/:id', idParamRules, validate, async (req, res, next) => {
  try {
    const task = TaskService.getTaskById(req.params.id);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/tasks
 * Шинэ даалгавар үүсгэх
 */
router.post('/', createTaskRules, validate, async (req, res, next) => {
  try {
    const task = TaskService.createTask(req.body);
    res.status(201).json({ success: true, data: task, message: 'Даалгавар үүсгэгдлээ' });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/tasks/:id
 * Даалгавар засах
 */
router.put('/:id', [...idParamRules, ...updateTaskRules], validate, async (req, res, next) => {
  try {
    const task = TaskService.updateTask(req.params.id, req.body);
    res.json({ success: true, data: task, message: 'Даалгавар шинэчлэгдлээ' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/tasks/:id
 * Даалгавар устгах
 */
router.delete('/:id', idParamRules, validate, async (req, res, next) => {
  try {
    TaskService.deleteTask(req.params.id);
    res.json({ success: true, message: 'Даалгавар устгагдлаа' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/tasks/:id/tags/:tagId
 * Tag нэмэх
 */
router.post('/:id/tags/:tagId', async (req, res, next) => {
  try {
    const task = TaskService.addTagToTask(
      Number(req.params.id),
      Number(req.params.tagId)
    );
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
