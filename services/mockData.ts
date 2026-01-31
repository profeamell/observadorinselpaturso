
import { AppState, UserRole } from '../types';

export const INITIAL_DATA: AppState = {
  users: [
    { id: 'u1', username: 'admin', role: 'ADMIN', name: 'Administrador General' },
    { id: 'u2', username: 'docente1', role: 'TEACHER', name: 'Juan Pérez' }
  ],
  // Added missing teachers property required by AppState interface
  teachers: [],
  students: [
    {
      id: 's1',
      documentId: '1092837465',
      documentType: 'TI',
      courseId: 'c1',
      firstName: 'Carlos',
      lastName: 'Gomez',
      birthDate: '2010-05-15',
      studentPhone: '3124567890',
      studentAddress: 'Calle 10 #5-20',
      guardianName: 'Marta Gomez',
      guardianPhone: '3109876543',
      guardianRelationship: 'Madre',
      siblingCount: 1,
      lastUpdated: new Date().toISOString(),
      eps: 'Sanitas',
      rhFactor: 'O+',
      medicalConditions: 'Ninguna',
      medicalFormulation: 'Ninguna',
      failedYears: 'Ninguno',
      previousSchool: 'Colegio Departamental',
      transferReason: 'Cambio de domicilio',
      historyObservations: 'Buen desempeño académico',
      favoriteSubjects: 'Matemáticas, Física',
      difficultSubjects: 'Inglés',
      freeTimeActivities: 'Fútbol',
      lifeProject: 'Ingeniero de Sistemas',
      directorId: 'u2'
    }
  ],
  incidents: [
    {
      id: 'i1',
      studentId: 's1',
      studentName: 'Carlos Gomez',
      courseName: '1001',
      type: 'Disciplinaria',
      faultTypeId: 'f1',
      date: '2024-03-10',
      // Fix: Changed followUp to follow_up to match the Incident interface definition
      follow_up: true,
      period: '1',
      observation: 'Llegada tarde recurrente',
      registeredByTeacherId: 'u2',
      registeredByTeacherName: 'Juan Pérez'
    }
  ],
  courses: [
    { id: 'c1', name: '1001' },
    { id: 'c2', name: '1002' },
    { id: 'c3', name: '1101' }
  ],
  faultTypes: [
    { id: 'f1', type: 'Tipo1' },
    { id: 'f2', type: 'Tipo2' },
    { id: 'f3', type: 'Tipo3' },
    { id: 'f4', type: 'Observación' }
  ],
  // Add missing groupAssignments property required by AppState interface
  groupAssignments: [],
  currentUser: null
};
