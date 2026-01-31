
export type UserRole = 'ADMIN' | 'TEACHER';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
  courseId?: string; // Nuevo campo opcional
}

export interface Teacher {
  id: string;
  name: string;
  document_id?: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface GroupAssignment {
  courseId: string;
  teacherId: string;
  teacherName?: string;
  courseName?: string;
}

export interface FaultType {
  id: string;
  type: 'Tipo1' | 'Tipo2' | 'Tipo3' | 'Observación';
}

export interface Student {
  id: string;
  documentId: string;
  documentType: string;
  courseId: string;
  photoBase64?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  studentPhone: string;
  studentAddress: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  siblingCount: number;
  lastUpdated: string;
  eps: string;
  rhFactor: string;
  medicalConditions: string;
  medicalFormulation: string;
  failedYears: string;
  previousSchool: string;
  transferReason: string;
  historyObservations: string;
  favoriteSubjects: string;
  difficultSubjects: string;
  freeTimeActivities: string;
  lifeProject: string;
  directorId: string;
}

export type IncidentType = 'Académica' | 'Disciplinaria';

export interface Incident {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  type: IncidentType;
  faultTypeId?: string;
  date: string;
  follow_up: boolean;
  period: '1' | '2' | '3' | '4';
  observation: string;
  evidenceBase64?: string;
  registeredByTeacherId: string;
  registeredByTeacherName: string;
}

export interface AppState {
  users: User[];
  teachers: Teacher[];
  students: Student[];
  incidents: Incident[];
  courses: Course[];
  faultTypes: FaultType[];
  groupAssignments: GroupAssignment[];
  currentUser: User | null;
}
