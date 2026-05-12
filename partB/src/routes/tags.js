/**
 * Tags Router — /api/v1/tags
 */
const express = require('express');
const router = express.Router();
const TagModel = require('../models/tag.model');
const { body, param, validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation алдаа', details: errors.array() });
  }
  next();
}

// GET /api/v1/tags
router.get('/', (req, res) => {
  const tags = TagModel.findAll();
  res.json({ success: true, data: tags });
});

// POST /api/v1/tags
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Нэр заавал').isLength({ max: 50 }),
    body('color').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('color нь hex (#rrggbb) байх ёстой'),
  ],
  validate,
  (req, res) => {
    try {
      const tag = TagModel.create(req.body);
      res.status(201).json({ success: true, data: tag });
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ success: false, error: 'Ийм нэртэй tag байна' });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// DELETE /api/v1/tags/:id
router.delete('/:id',
  [param('id').isInt({ min: 1 })],
  validate,
  (req, res) => {
    const deleted = TagModel.remove(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Tag олдсонгүй' });
    res.json({ success: true, message: 'Tag устгагдлаа' });
  }
);

module.exports = router;
