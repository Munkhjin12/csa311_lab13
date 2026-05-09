/**
 * Personal Task Tracker — Entry Point
 * F.CSM311 Бие даалт 13
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const taskRoutes = require('./routes/tasks');
const tagRoutes = require('./routes/tags');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { migrate } = require('./db/migrate');
const TaskModel = require('./models/task.model');
const { seed } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger тохиргоо
const openapiDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// API Routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/tags', tagRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Task Tracker API ажиллаж байна 🚀', version: '1.0.0' });
});

// 4. Хамгийн төгсгөлд нь Error handlers (Энэ нь Swagger-ийн доор байх ёстой)
app.use(notFound);
app.use(errorHandler);

// Server эхлүүлэх
if (require.main === module) {
  migrate(); 

  // Анхны сервер эхлэх үед өгөгдөл байхгүй бол seed оруулах
  if (TaskModel.count({}) === 0) {
    seed();
  }

  app.listen(PORT, () => {
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`📋 API docs: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;