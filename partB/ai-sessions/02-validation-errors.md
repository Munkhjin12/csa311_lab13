# AI Session 02 — Validation & Error Handling

**Огноо:** 2026-05-02
**Үргэлжилсэн:** ~30 мин  
**Зорилго:** express-validator тохируулах, global error handler

---

## Асуулт 1: express-validator хэрэглэх

**Би:** express-validator v7-д routes дотор validation хэрхэн тохируулах вэ?

**Claude:** 
```javascript
const { body, validationResult } = require('express-validator');

router.post('/', [
  body('title').trim().notEmpty().isLength({ max: 200 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  // ...
});
```

⚠️ **Hallucination шалгалт:** Claude `check()` function санал болгосон — express-validator v7-д `body()`, `param()`, `query()` тусдаа функц байдаг, `check()` нь deprecated. Баримт бичгээр шалгаж засав.

---

## Асуулт 2: Validation middleware тусгаарлах

**Би:** Validation logic-г router-аас тусгаарлах сайн арга юу вэ?

**Claude:** Rules array + validate middleware pattern:
```javascript
// middleware/validate.js
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({...});
  next();
}

// routes/tasks.js
router.post('/', createTaskRules, validate, handler);
```

✅ **Хэрэглэсэн:** validate.js middleware-д тусгаарлаж DRY зарчим баримталсан.

---

## Асуулт 3: Global error handler

**Би:** Express-д global error handler хэрхэн бичих вэ? 404 болон 500 алдааг ялгаж харуулах.

**Claude:** 4 аргументтай middleware — `(err, req, res, next)`. Express энэ signature-г тусгайлан таньдаг:
```javascript
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});
```

Custom error-д `statusCode` property нэмэх:
```javascript
const err = new Error('Not found');
err.statusCode = 404;
throw err;
```

✅ **Хэрэглэсэн:** errorHandler.js болон task.service.js-д statusCode pattern.

---

## Security жишээ

Claude-ийн анхны error handler нь dev/prod ялгахгүй stack trace хэрэглэгчид харуулж байсан:
```javascript
// Аюултай — Claude анхлан санал болгосон:
res.json({ error: err.message, stack: err.stack });
```

`NODE_ENV` шалгаж засав:
```javascript
// Зассан:
const isDev = process.env.NODE_ENV === 'development';
res.json({ error: err.message, ...(isDev && { stack: err.stack }) });
```
