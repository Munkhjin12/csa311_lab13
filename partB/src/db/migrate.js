/**
 * Database migration runner
 * schema.sql-г ажиллуулж DB үүсгэнэ
 */
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/tasks.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function migrate() {
  // data/ директор үүсгэх (файл DB үед)
  if (DB_PATH !== ':memory:') {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  const db = new Database(DB_PATH);
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

  db.exec(schema);
  db.close();

  console.log('✅ Migration амжилттай:', DB_PATH);
}

// Шууд ажиллуулах үед
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
