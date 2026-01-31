
import React, { useState, useEffect } from 'react';
import { 
  X, Camera, User, HeartPulse, History, Star, Save, Lock
} from 'lucide-react';
import { Student, Course, AppState, UserRole } from '../types';
import { DOCUMENT_TYPES, RH_FACTORS } from '../constants';

interface StudentFormProps {
  student?: Student;
  courses: Course[];
  onSave: (student: Student) => void;
  onClose: () => void;
  currentUser: AppState['currentUser'];
}

const StudentForm: React.FC<StudentFormProps> = ({ student, courses, onSave, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'history' | 'interests'>('personal');
  
  // Determinar si el usuario es docente y tiene un curso asignado
  const isTeacher = currentUser?.role === 'TEACHER';
  const assignedCourseId = currentUser?.courseId;
  const isNewStudent = !student;

  const [formData, setFormData] = useState<Partial<Student>>(student || {
    documentId: '',
    documentType: 'TI',
    // Si es docente y es nuevo estudiante, forzar su curso asignado
    courseId: (isNewStudent && isTeacher && assignedCourseId) ? assignedCourseId : (courses[0]?.id || ''),
    firstName: '',
    lastName: '',
    birthDate: '',
    studentPhone: '',
    studentAddress: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: '',
    siblingCount: 0,
    eps: '',
    rhFactor: 'O+',
    medicalConditions: '',
    medicalFormulation: '',
    failedYears: '',
    previousSchool: '',
    transferReason: '',
    historyObservations: '',
    favoriteSubjects: '',
    difficultSubjects: '',
    freeTimeActivities: '',
    lifeProject: '',
    directorId: currentUser?.id || '',
    lastUpdated: new Date().toISOString()
  });

  // Efecto para asegurar que si el docente cambia su curso asignado (poco común durante la sesión), el form se actualice
  useEffect(() => {
    if (isNewStudent && isTeacher && assignedCourseId && formData.courseId !== assignedCourseId) {
      setFormData(prev => ({ ...prev, courseId: assignedCourseId }));
    }
  }, [assignedCourseId, isTeacher, isNewStudent]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData as Student,
      id: student?.id || Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString()
    });
  };

  const tabs = [
    { id: 'personal', label: 'Datos Personales', icon: User, color: 'text-blue-600', border: 'border-blue-600' },
    { id: 'medical', label: 'Datos Médicos', icon: HeartPulse, color: 'text-red-600', border: 'border-red-600' },
    { id: 'history', label: 'Historial', icon: History, color: 'text-emerald-600', border: 'border-emerald-600' },
    { id: 'interests', label: 'Intereses', icon: Star, color: 'text-purple-600', border: 'border-purple-600' },
  ];

  const canEdit = currentUser?.role === 'ADMIN' || (student?.directorId === currentUser?.id) || !student;

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl border border-slate-100">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">Acceso Denegado</h2>
          <p className="text-slate-500 text-sm mb-8 font-bold leading-relaxed uppercase tracking-tight">Solo el administrador o el director de grupo pueden editar esta ficha.</p>
          <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Cerrar</button>
        </div>
      </div>
    );
  }

  const sortedCourses = [...courses].sort((a, b) => 
    a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' })
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.3)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{student ? 'Editar Estudiante' : 'Nuevo Registro'}</h2>
            {formData.lastUpdated && (
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Última actualización: {new Date(formData.lastUpdated!).toLocaleString()}</p>
            )}
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900"><X size={24}/></button>
        </div>

        <div className="flex bg-slate-50/50 border-b border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-3 py-5 border-b-2 transition-all ${
                  isActive 
                    ? `${tab.border} ${tab.color} bg-white font-black` 
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} className={isActive ? tab.color : 'text-slate-400'} />
                <span className="text-[10px] uppercase tracking-widest hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 bg-white">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 bg-slate-50 rounded-[2rem] overflow-hidden relative group border-2 border-slate-100 shadow-sm transition-all hover:border-slate-300">
                  {formData.photoBase64 ? (
                    <img src={formData.photoBase64} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <User size={80} />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white" size={32} />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormInput label="Nombres" value={formData.firstName} onChange={v => setFormData({...formData, firstName: v})} />
                <FormInput label="Apellidos" value={formData.lastName} onChange={v => setFormData({...formData, lastName: v})} />
                <FormSelect label="Tipo Documento" options={DOCUMENT_TYPES} value={formData.documentType} onChange={v => setFormData({...formData, documentType: v})} />
                <FormInput label="Nro Documento" value={formData.documentId} onChange={v => setFormData({...formData, documentId: v})} />
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso</label>
                    {isTeacher && assignedCourseId && (
                      <div className="flex items-center space-x-1 text-[9px] text-blue-600 font-black uppercase">
                        <Lock size={10} />
                        <span>Asignado</span>
                      </div>
                    )}
                  </div>
                  <select 
                    disabled={isTeacher && !!assignedCourseId}
                    value={formData.courseId} 
                    onChange={e => setFormData({...formData, courseId: e.target.value})} 
                    className={`w-full px-5 py-3.5 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-sm transition-all ${
                      isTeacher && assignedCourseId 
                        ? 'bg-slate-50 text-slate-500 cursor-not-allowed border-blue-100' 
                        : 'bg-white text-black focus:border-slate-900'
                    }`}
                  >
                    {sortedCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Fecha Nacimiento</label>
                  <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black focus:border-slate-900 transition-all shadow-sm" />
                </div>
                <FormInput label="Dirección" value={formData.studentAddress} onChange={v => setFormData({...formData, studentAddress: v})} />
                <FormInput label="Teléfono Estudiante" value={formData.studentPhone} onChange={v => setFormData({...formData, studentPhone: v})} />
                <FormInput label="Nombre Acudiente" value={formData.guardianName} onChange={v => setFormData({...formData, guardianName: v})} />
                <FormInput label="Teléfono Acudiente" value={formData.guardianPhone} onChange={v => setFormData({...formData, guardianPhone: v})} />
                <FormInput label="Parentesco" value={formData.guardianRelationship} onChange={v => setFormData({...formData, guardianRelationship: v})} />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Número de Hermanos</label>
                  <input type="number" value={formData.siblingCount} onChange={e => setFormData({...formData, siblingCount: parseInt(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black focus:border-slate-900 transition-all shadow-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput label="EPS" value={formData.eps} onChange={v => setFormData({...formData, eps: v})} />
              <FormSelect label="Factor RH" options={RH_FACTORS} value={formData.rhFactor} onChange={v => setFormData({...formData, rhFactor: v})} />
              <FormTextarea label="Enfermedades / Condiciones" value={formData.medicalConditions} onChange={v => setFormData({...formData, medicalConditions: v})} placeholder="Describa si el estudiante padece alguna condición médica..." />
              <FormTextarea label="Formulación Médica" value={formData.medicalFormulation} onChange={v => setFormData({...formData, medicalFormulation: v})} placeholder="Medicamentos o tratamientos actuales..." />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Años Reprobados" value={formData.failedYears} onChange={v => setFormData({...formData, failedYears: v})} placeholder="Ej: 5° - 2021" />
                <FormInput label="Último Colegio" value={formData.previousSchool} onChange={v => setFormData({...formData, previousSchool: v})} />
              </div>
              <FormTextarea label="Motivo Traslado" value={formData.transferReason} onChange={v => setFormData({...formData, transferReason: v})} />
              <FormTextarea label="Observaciones Académicas/Disciplinarias Históricas" rows={6} value={formData.historyObservations} onChange={v => setFormData({...formData, historyObservations: v})} />
            </div>
          )}

          {activeTab === 'interests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormTextarea label="Materias Favoritas" value={formData.favoriteSubjects} onChange={v => setFormData({...formData, favoriteSubjects: v})} />
              <FormTextarea label="Materias con Dificultad" value={formData.difficultSubjects} onChange={v => setFormData({...formData, difficultSubjects: v})} />
              <FormTextarea label="Actividades Tiempo Libre" span2 value={formData.freeTimeActivities} onChange={v => setFormData({...formData, freeTimeActivities: v})} />
              <FormTextarea label="Proyecto de Vida" span2 rows={6} value={formData.lifeProject} onChange={v => setFormData({...formData, lifeProject: v})} />
            </div>
          )}
        </form>

        <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
          <button onClick={onClose} type="button" className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Cancelar</button>
          <button onClick={handleSubmit} type="button" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center space-x-3">
            <Save size={18} />
            <span>Guardar Registro Integral</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const FormInput: React.FC<{ label: string, value?: string, onChange: (v: string) => void, placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
    <input required value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black focus:border-slate-900 transition-all shadow-sm" />
  </div>
);

const FormSelect: React.FC<{ label: string, options: readonly string[], value?: string, onChange: (v: string) => void }> = ({ label, options, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black focus:border-slate-900 transition-all shadow-sm">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const FormTextarea: React.FC<{ label: string, value?: string, onChange: (v: string) => void, placeholder?: string, rows?: number, span2?: boolean }> = ({ label, value, onChange, placeholder, rows = 3, span2 = false }) => (
  <div className={`space-y-1.5 ${span2 ? 'md:col-span-2' : ''}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
    <textarea rows={rows} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black focus:border-slate-900 transition-all shadow-sm resize-none" />
  </div>
);

export default StudentForm;
