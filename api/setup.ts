
import { getDb } from './db';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return res.status(200).end();
  }

  const db = getDb();
  
  try {
    await db.sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, name TEXT)`;
    await db.sql`CREATE TABLE IF NOT EXISTS teachers (id TEXT PRIMARY KEY, name TEXT, document_id TEXT UNIQUE)`;
    await db.sql`CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, name TEXT UNIQUE)`;
    await db.sql`CREATE TABLE IF NOT EXISTS fault_types (id TEXT PRIMARY KEY, type TEXT)`;
    
    await db.sql`CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY, document_id TEXT UNIQUE, document_type TEXT, course_id TEXT, 
      photo_base64 TEXT, first_name TEXT, last_name TEXT, birth_date TEXT, 
      student_phone TEXT, student_address TEXT, guardian_name TEXT, guardian_phone TEXT, 
      guardian_relationship TEXT, sibling_count INTEGER, eps TEXT, rh_factor TEXT, 
      medical_conditions TEXT, medical_formulation TEXT, failed_years TEXT, 
      previous_school TEXT, transfer_reason TEXT, history_observations TEXT, 
      favorite_subjects TEXT, difficult_subjects TEXT, free_time_activities TEXT, 
      life_project TEXT, director_id TEXT, last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

    await db.sql`CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY, student_id TEXT, student_name TEXT, course_name TEXT, 
      type TEXT, fault_type_id TEXT, date TEXT, follow_up INTEGER, period TEXT, 
      observation TEXT, evidence_base64 TEXT, registered_by_teacher_id TEXT, 
      registered_by_teacher_name TEXT
    )`;

    await db.sql`INSERT OR IGNORE INTO users (id, username, password, role, name) VALUES ('u1', 'admin', '1122', 'ADMIN', 'Administrador General')`;
    
    const teachers = [['t1', 'Juan Pérez', '1010'], ['t2', 'María Rodríguez', '2020'], ['t3', 'Andrés Mendoza', '3030']];
    for (const [id, name, doc] of teachers) {
      await db.sql`INSERT OR IGNORE INTO teachers (id, name, document_id) VALUES (${id}, ${name}, ${doc})`;
    }

    const courses = [['c1', '1001'], ['c2', '1002'], ['c3', '1101'], ['c4', '1102']];
    for (const [id, name] of courses) {
      await db.sql`INSERT OR IGNORE INTO courses (id, name) VALUES (${id}, ${name})`;
    }

    const faults = [['f1', 'Falta Tipo I'], ['f2', 'Falta Tipo II'], ['f3', 'Falta Tipo III'], ['f4', 'Observación']];
    for (const [id, type] of faults) {
      await db.sql`INSERT OR IGNORE INTO fault_types (id, type) VALUES (${id}, ${type})`;
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({ 
      status: 'success', 
      message: 'Tablas e índices sincronizados correctamente, incluyendo docentes.' 
    }));
  } catch (err: any) {
    console.error('CRITICAL SETUP ERROR:', err.message);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).send(JSON.stringify({ 
      status: 'error', 
      error: err.message
    }));
  }
}
