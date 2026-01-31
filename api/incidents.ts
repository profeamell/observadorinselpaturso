
import { getDb } from './db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const i = req.body;
  const db = getDb();
  try {
    await db.sql`
      INSERT INTO incidents (
        id, student_id, student_name, course_name, type, fault_type_id, 
        date, follow_up, period, observation, evidence_base64, 
        registered_by_teacher_id, registered_by_teacher_name
      ) VALUES (
        ${i.id}, ${i.studentId}, ${i.studentName}, ${i.courseName}, ${i.type}, ${i.faultTypeId},
        ${i.date}, ${i.followUp ? 1 : 0}, ${i.period}, ${i.observation}, ${i.evidenceBase64},
        ${i.registeredByTeacherId}, ${i.registeredByTeacherName}
      )`;
    return res.status(200).json(i);
  } catch (error: any) {
    console.error('Incident API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
