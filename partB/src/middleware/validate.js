/**
 * Input validation middleware — express-validator ашиглана
 */
const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation алдааг шалгах helper
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation алдаа',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// Task үүсгэх rules
const createTaskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Гарчиг заавал')
    .isLength({ max: 200 }).withMessage('Гарчиг 200 тэмдэгтээс хэтрэхгүй'),
  body('description')
    .optional()
    .isString().withMessage('Тайлбар текст байх ёстой')
    .isLength({ max: 1000 }).withMessage('Тайлбар 1000 тэмдэгтээс хэтрэхгүй'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'done']).withMessage('status: pending | in-progress | done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('priority: low | medium | high'),
  body('due_date')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('due_date формат: YYYY-MM-DD'),
];

// Task засах rules (бүх талбар optional)
const updateTaskRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Гарчиг хоосон байж болохгүй')
    .isLength({ max: 200 }).withMessage('Гарчиг 200 тэмдэгтээс хэтрэхгүй'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 1000 }),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'done']),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']),
  body('due_date')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('due_date формат: YYYY-MM-DD'),
];

// ID param шалгалт
const idParamRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID нь эерэг бүхэл тоо байх ёстой'),
];

// Query filter rules
const filterRules = [
  query('status')
    .optional()
    .isIn(['pending', 'in-progress', 'done']),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high']),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit: 1-100'),
];

module.exports = {
  validate,
  createTaskRules,
  updateTaskRules,
  idParamRules,
  filterRules,
};
