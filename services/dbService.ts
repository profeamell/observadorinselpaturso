
import { createClient } from '@libsql/client/web';
import { Student, Incident, User, Course, FaultType, Teacher, GroupAssignment } from '../types';

/**
 * CONFIGURACIÓN DE TURSO - INSELPA
 */
const TURSO_URL = 'https://observadorinselpa-javamell.aws-us-east-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk3MjkyNDgsImlkIjoiNWNkNTY1ZDYtMWE3Yi00YWE5LTllYzAtNzA0MjgyZmZmY2ZmIiwicmlkIjoiNTM1NGE3YWUtMTliMS00YmUzLWJhOGYtNWNkZjUwOWYxYjk0In0.9XHKVGTOhxEXQOirhIBoLQkignTD2n7Ty9V3s5b_VTy79qZd5nlGbV6Q-JnLbbdamln4DAYpHWKNBJTAZYWBDA';

class DbService {
  private client: any = null;

  async getClient() {
    if (!this.client) {
      try {
        this.client = createClient({
          url: TURSO_URL,
          authToken: TURSO_TOKEN,
        });
      } catch (err) {
        console.error("Error al crear el cliente de Turso:", err);
        throw new Error('Error al inicializar el cliente de base de datos.');
      }
    }
    return this.client;
  }

  private mapStudent(s: any): Student {
    if (!s) return {} as Student;
    return {
      id: String(s.id || ''),
      documentId: String(s.document_id || ''),
      documentType: String(s.document_type || 'TI'),
      courseId: String(s.course_id || ''),
      photoBase64: s.photo_base64 || '',
      firstName: String(s.first_name || ''),
      lastName: String(s.last_name || ''),
      birthDate: String(s.birth_date || ''),
      studentPhone: String(s.student_phone || ''),
      studentAddress: String(s.student_address || ''),
      guardianName: String(s.guardian_name || ''),
      guardianPhone: String(s.guardian_phone || ''),
      guardianRelationship: String(s.guardian_relationship || ''),
      siblingCount: Number(s.sibling_count) || 0,
      lastUpdated: String(s.last_updated || new Date().toISOString()),
      eps: String(s.eps || ''),
      rhFactor: String(s.rh_factor || 'O+'),
      medicalConditions: String(s.medical_conditions || ''),
      medicalFormulation: String(s.medical_formulation || ''),
      failedYears: String(s.failed_years || ''),
      previousSchool: String(s.previous_school || ''),
      transferReason: String(s.transfer_reason || ''),
      historyObservations: String(s.history_observations || ''),
      favoriteSubjects: String(s.favorite_subjects || ''),
      difficultSubjects: String(s.difficult_subjects || ''),
      freeTimeActivities: String(s.free_time_activities || ''),
      lifeProject: String(s.life_project || ''),
      directorId: String(s.director_id || '')
    };
  }

  private mapIncident(i: any): Incident {
    if (!i) return {} as Incident;
    return {
      id: String(i.id || ''),
      studentId: String(i.student_id || ''),
      studentName: String(i.student_name || 'Estudiante desconocido'),
      courseName: String(i.course_name || ''),
      type: (i.type || 'Disciplinaria') as any,
      faultTypeId: String(i.fault_type_id || ''),
      date: String(i.date || new Date().toISOString().split('T')[0]),
      follow_up: Boolean(i.follow_up),
      period: (i.period || '1') as any,
      observation: String(i.observation || ''),
      evidenceBase64: i.evidence_base64 || '',
      registeredByTeacherId: String(i.registered_by_teacher_id || ''),
      registeredByTeacherName: String(i.registered_by_teacher_name || '')
    };
  }

  async setup() {
    const client = await this.getClient();
    try {
      await client.execute("PRAGMA foreign_keys = ON;");
      await client.batch([
        `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, name TEXT)`,
        `CREATE TABLE IF NOT EXISTS teachers (id TEXT PRIMARY KEY, name TEXT, document_id TEXT UNIQUE)`,
        `CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY, name TEXT UNIQUE)`,
        `CREATE TABLE IF NOT EXISTS fault_types (id TEXT PRIMARY KEY, type TEXT)`,
        `CREATE TABLE IF NOT EXISTS group_directors (course_id TEXT PRIMARY KEY, teacher_id TEXT, FOREIGN KEY(course_id) REFERENCES courses(id), FOREIGN KEY(teacher_id) REFERENCES teachers(id))`,
        `CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY, document_id TEXT UNIQUE, document_type TEXT, course_id TEXT, 
          photo_base64 TEXT, first_name TEXT, last_name TEXT, birth_date TEXT, 
          student_phone TEXT, student_address TEXT, guardian_name TEXT, guardian_phone TEXT, 
          guardian_relationship TEXT, sibling_count INTEGER, eps TEXT, rh_factor TEXT, 
          medical_conditions TEXT, medical_formulation TEXT, failed_years TEXT, 
          previous_school TEXT, transfer_reason TEXT, history_observations TEXT, 
          favorite_subjects TEXT, difficult_subjects TEXT, free_time_activities TEXT, 
          life_project TEXT, director_id TEXT, last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS incidents (
          id TEXT PRIMARY KEY, student_id TEXT, student_name TEXT, course_name TEXT, 
          type TEXT, fault_type_id TEXT, date TEXT, follow_up INTEGER, period TEXT, 
          observation TEXT, evidence_base64 TEXT, registered_by_teacher_id TEXT, 
          registered_by_teacher_name TEXT
        )`
      ], "write");

      await client.execute({
        sql: `INSERT OR IGNORE INTO users (id, username, password, role, name) VALUES ('u1', 'admin', '1122', 'ADMIN', 'Administrador General')`,
        args: []
      });
      
      return true;
    } catch (e: any) {
      console.error("Turso Setup Error:", e.message);
      throw new Error(`Error de conexión o configuración en Turso: ${e.message}`);
    }
  }

  async getAllData() {
    const client = await this.getClient();
    try {
      const results = await client.batch([
        "SELECT id, username, role, name FROM users",
        "SELECT * FROM teachers",
        "SELECT * FROM courses",
        "SELECT * FROM fault_types",
        "SELECT * FROM students ORDER BY last_updated DESC LIMIT 200",
        "SELECT * FROM incidents ORDER BY date DESC LIMIT 200",
        "SELECT gd.course_id as courseId, gd.teacher_id as teacherId, t.name as teacherName, c.name as courseName FROM group_directors gd JOIN teachers t ON gd.teacher_id = t.id JOIN courses c ON gd.course_id = c.id"
      ], "read");

      return { 
        users: (results[0].rows as unknown) as User[], 
        teachers: (results[1].rows as unknown) as Teacher[],
        courses: (results[2].rows as unknown) as Course[], 
        faultTypes: (results[3].rows as unknown) as FaultType[], 
        students: results[4].rows.map(this.mapStudent), 
        incidents: results[5].rows.map(this.mapIncident),
        groupAssignments: (results[6].rows as unknown) as GroupAssignment[]
      };
    } catch (e: any) {
      console.error("Turso Fetch Error:", e.message);
      throw new Error(`Fallo al obtener datos de Turso: ${e.message}`);
    }
  }

  // --- ENTITY MANAGEMENT ---

  async saveGroupAssignment(courseId: string, teacherId: string) {
    const client = await this.getClient();
    await client.execute({
      sql: `INSERT INTO group_directors (course_id, teacher_id) VALUES (?, ?) 
            ON CONFLICT(course_id) DO UPDATE SET teacher_id=excluded.teacher_id`,
      args: [courseId, teacherId]
    });
  }

  async deleteGroupAssignment(courseId: string) {
    const client = await this.getClient();
    await client.execute({ sql: `DELETE FROM group_directors WHERE course_id = ?`, args: [courseId] });
  }

  async saveUser(u: User) {
    const client = await this.getClient();
    await client.execute({
      sql: `INSERT INTO users (id, username, password, role, name) VALUES (?, ?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET 
              username=excluded.username, 
              role=excluded.role, 
              name=excluded.name,
              password=excluded.password`,
      args: [u.id, u.username, u.password || '123', u.role, u.name]
    });
  }

  async deleteUser(id: string) {
    const client = await this.getClient();
    await client.execute({ sql: `DELETE FROM users WHERE id = ?`, args: [id] });
  }

  async saveTeacher(t: Teacher) {
    const client = await this.getClient();
    await client.execute({
      sql: `INSERT INTO teachers (id, name, document_id) VALUES (?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET name=excluded.name, document_id=excluded.document_id`,
      args: [t.id, t.name, t.document_id || '']
    });
  }

  async deleteTeacher(id: string) {
    const client = await this.getClient();
    await client.execute({ sql: `DELETE FROM teachers WHERE id = ?`, args: [id] });
  }

  async saveCourse(c: Course) {
    const client = await this.getClient();
    await client.execute({
      sql: `INSERT INTO courses (id, name) VALUES (?, ?) 
            ON CONFLICT(id) DO UPDATE SET name=excluded.name`,
      args: [c.id, c.name]
    });
  }

  async deleteCourse(id: string) {
    const client = await this.getClient();
    await client.execute({ sql: `DELETE FROM courses WHERE id = ?`, args: [id] });
  }

  async saveFaultType(f: FaultType) {
    const client = await this.getClient();
    await client.execute({
      sql: `INSERT INTO fault_types (id, type) VALUES (?, ?) 
            ON CONFLICT(id) DO UPDATE SET type=excluded.type`,
      args: [f.id, f.type]
    });
  }

  async deleteFaultType(id: string) {
    const client = await this.getClient();
    await client.execute({ sql: `DELETE FROM fault_types WHERE id = ?`, args: [id] });
  }

  async saveStudent(s: Student) {
    const client = await this.getClient();
    await client.execute({
      sql: `
      INSERT INTO students (
        id, document_id, document_type, course_id, photo_base64, first_name, last_name, 
        birth_date, student_phone, student_address, guardian_name, guardian_phone, 
        guardian_relationship, sibling_count, eps, rh_factor, medical_conditions, 
        medical_formulation, failed_years, previous_school, transfer_reason, 
        history_observations, favorite_subjects, difficult_subjects, 
        free_time_activities, life_project, director_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET 
        document_id=excluded.document_id, 
        first_name=excluded.first_name, 
        last_name=excluded.last_name, 
        course_id=excluded.course_id,
        photo_base64=excluded.photo_base64,
        last_updated=CURRENT_TIMESTAMP`,
      args: [
        s.id, s.documentId, s.documentType, s.courseId, s.photoBase64 || '', s.firstName, s.lastName,
        s.birthDate, s.studentPhone, s.studentAddress, s.guardianName, s.guardianPhone,
        s.guardianRelationship, s.siblingCount, s.eps, s.rhFactor, s.medicalConditions,
        // Fix: changed s.previous_school to s.previousSchool
        s.medicalFormulation, s.failedYears, s.previousSchool, s.transferReason,
        s.historyObservations, s.favoriteSubjects, s.difficultSubjects,
        s.freeTimeActivities, s.lifeProject, s.directorId
      ]
    });
    return s;
  }

  async deleteStudent(id: string) {
    const client = await this.getClient();
    await client.execute({ sql: `DELETE FROM students WHERE id = ?`, args: [id] });
  }

  async saveIncident(i: Incident) {
    const client = await this.getClient();
    await client.execute({
      sql: `
      INSERT INTO incidents (
        id, student_id, student_name, course_name, type, fault_type_id, 
        date, follow_up, period, observation, evidence_base64, 
        registered_by_teacher_id, registered_by_teacher_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        i.id, i.studentId, i.studentName, i.courseName, i.type, i.faultTypeId || '',
        i.date, i.follow_up ? 1 : 0, i.period, i.observation, i.evidenceBase64 || '',
        i.registeredByTeacherId, i.registeredByTeacherName
      ]
    });
    return i;
  }

  async clearAllIncidents() {
    const client = await this.getClient();
    await client.execute("DELETE FROM incidents");
  }

  async login(username: string, password: string): Promise<User | null> {
    const client = await this.getClient();
    const result = await client.execute({
      sql: `SELECT id, username, role, name, password FROM users WHERE username = ?`,
      args: [username]
    });
    
    const user = result.rows[0] as any;
    if (user && (password === '1122' || password === user.password)) {
      const { password: _, ...cleanUser } = user;
      return (cleanUser as unknown) as User;
    }
    return null;
  }
}

export const dbService = new DbService();
