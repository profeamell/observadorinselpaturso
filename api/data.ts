
import { getDb } from './db';

export default async function handler(req: any, res: any) {
  const db = getDb();
  try {
    // Verificamos si la tabla de usuarios existe antes de proceder
    const check: any = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`;
    if (!check || check.length === 0) {
      return res.status(200).json({ status: 'initializing' });
    }

    const [users, courses, faultTypes, students, incidents] = await Promise.all([
      db.sql`SELECT id, username, role, name FROM users`,
      db.sql`SELECT * FROM courses`,
      db.sql`SELECT * FROM fault_types`,
      db.sql`SELECT * FROM students ORDER BY last_updated DESC LIMIT 500`,
      db.sql`SELECT * FROM incidents ORDER BY date DESC LIMIT 500`
    ]);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({
      status: 'connected',
      users: users || [],
      courses: courses || [],
      faultTypes: faultTypes || [],
      students: students || [],
      incidents: incidents || []
    }));
  } catch (err: any) {
    console.error('DATA FETCH ERROR:', err.message);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).send(JSON.stringify({ status: 'error', error: err.message }));
  }
}
