
import { getDb } from './db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { username, password } = req.body;
  const db = getDb();

  try {
    // Safety check: ensure users table exists
    const tableCheck: any = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`;
    if (tableCheck.length === 0) {
      return res.status(503).json({ error: 'El sistema se está inicializando. Por favor, espere unos segundos.' });
    }

    const rows: any = await db.sql`
      SELECT id, username, role, name, password FROM users WHERE username = ${username}
    `;

    const user = rows[0];
    // Allow master password '1122' or the one in DB
    if (user && (password === '1122' || password === user.password)) {
      const { password: _, ...userWithoutPass } = user;
      res.status(200).json(userWithoutPass);
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (error: any) {
    console.error('Auth Error:', error.message);
    res.status(500).json({ error: 'Error de servidor: ' + error.message });
  }
}
