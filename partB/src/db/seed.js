/**
 * Seed data — туршилтын өгөгдөл
 */
const { getDb, closeDb } = require('./connection');
const { migrate } = require('./migrate');

function seed() {
  migrate();
  const db = getDb();

  // Хуучин өгөгдөл цэвэрлэх
  db.exec('DELETE FROM task_tags; DELETE FROM tasks; DELETE FROM tags;');

  // Tags
  const insertTag = db.prepare(
    'INSERT INTO tags (name, color) VALUES (?, ?)'
  );
  const tags = [
    insertTag.run('сургууль', '#6366f1'),
    insertTag.run('ажил', '#f59e0b'),
    insertTag.run('хувийн', '#10b981'),
    insertTag.run('яаралтай', '#ef4444'),
  ];

  // Tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tasks = [
    insertTask.run('Бие даалт 13 дуусгах', 'F.CSM311 AI-Assisted Software Construction', 'in-progress', 'high', '2025-04-28'),
    insertTask.run('Номын сан очих', 'Алгоритмын ном авах', 'pending', 'medium', '2025-04-16'),
    insertTask.run('Jest тест бичих', 'Task model-ийн unit test', 'pending', 'high', '2025-04-20'),
    insertTask.run('README шинэчлэх', 'Build болон run зааврыг нэмэх', 'done', 'low', null),
    insertTask.run('Спорт хийх', 'Долоо хоногт 3 удаа', 'pending', 'medium', '2025-04-15'),
  ];

  // Task-Tag холбоос
  const linkTag = db.prepare(
    'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)'
  );
  linkTag.run(tasks[0].lastInsertRowid, tags[0].lastInsertRowid); // бие даалт → сургууль
  linkTag.run(tasks[0].lastInsertRowid, tags[3].lastInsertRowid); // бие даалт → яаралтай
  linkTag.run(tasks[2].lastInsertRowid, tags[0].lastInsertRowid); // тест → сургууль
  linkTag.run(tasks[4].lastInsertRowid, tags[2].lastInsertRowid); // спорт → хувийн

  closeDb();
  console.log('✅ Seed өгөгдөл амжилттай оруулсан');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
