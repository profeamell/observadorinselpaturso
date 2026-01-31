
import { getDb } from './db';

export default async function handler(req: any, res: any) {
  const db = getDb();
  const { id } = req.query;

  try {
    if (req.method === 'POST') {
      const s = req.body;
      await db.sql`
        INSERT INTO students (
          id, document_id, document_type, course_id, photo_base64, first_name, last_name, 
          birth_date, student_phone, student_address, guardian_name, guardian_phone, 
          guardian_relationship, sibling_count, eps, rh_factor, medical_conditions, 
          medical_formulation, failed_years, previous_school, transfer_reason, 
          history_observations, favorite_subjects, difficult_subjects, 
          free_time_activities, life_project, director_id
        ) VALUES (
          ${s.id}, ${s.documentId}, ${s.documentType}, ${s.courseId}, ${s.photoBase64}, ${s.firstName}, ${s.lastName},
          ${s.birthDate}, ${s.studentPhone}, ${s.studentAddress}, ${s.guardianName}, ${s.guardianPhone},
          ${s.guardianRelationship}, ${s.siblingCount}, ${s.eps}, ${s.rhFactor}, ${s.medicalConditions},
          ${s.medicalFormulation}, ${s.failedYears}, ${s.previousSchool}, ${s.transferReason},
          ${s.historyObservations}, ${s.favoriteSubjects}, ${s.difficultSubjects},
          ${s.freeTimeActivities}, ${s.lifeProject}, ${s.directorId}
        )
        ON CONFLICT(id) DO UPDATE SET 
          document_id=excluded.document_id, 
          document_type=excluded.document_type, 
          course_id=excluded.course_id, 
          photo_base64=excluded.photo_base64, 
          first_name=excluded.first_name, 
          last_name=excluded.last_name, 
          birth_date=excluded.birth_date, 
          student_phone=excluded.student_phone,
          student_address=excluded.student_address, 
          guardian_name=excluded.guardian_name,
          guardian_phone=excluded.guardian_phone,
          guardian_relationship=excluded.guardian_relationship,
          sibling_count=excluded.sibling_count,
          eps=excluded.eps, 
          rh_factor=excluded.rh_factor, 
          medical_conditions=excluded.medical_conditions,
          medical_formulation=excluded.medical_formulation,
          failed_years=excluded.failed_years,
          previous_school=excluded.previous_school,
          transfer_reason=excluded.transfer_reason,
          history_observations=excluded.history_observations,
          favorite_subjects=excluded.favorite_subjects,
          difficult_subjects=excluded.difficult_subjects,
          free_time_activities=excluded.free_time_activities,
          life_project=excluded.life_project, 
          last_updated=CURRENT_TIMESTAMP`;
      
      return res.status(200).json(s);
    } 
    
    if (req.method === 'DELETE') {
      await db.sql`DELETE FROM students WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('Student API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
