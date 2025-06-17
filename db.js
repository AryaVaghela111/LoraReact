// db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join } from 'path';

const dbPromise = open({
  filename: join(process.cwd(), 'packets.db'),
  driver: sqlite3.Database,
});

(async () => {
  const db = await dbPromise;
  await db.run(`
    CREATE TABLE IF NOT EXISTS packets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      message TEXT NOT NULL,
      frequency REAL
    )
  `);
})();

export default dbPromise;
