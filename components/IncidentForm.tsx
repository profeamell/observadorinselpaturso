
import React, { useState } from 'react';
import { X, Camera, Save, ClipboardList, BookOpen, Search, UserCircle } from 'lucide-react';
import { Incident, Student, FaultType, AppState, IncidentType, User, Course } from '../types';
import { PERIODS } from '../constants';

interface IncidentFormProps {
  students: Student[];
  faultTypes: FaultType[];
  users: User[];
  courses: Course[]; // Añadido para resolver nombres de curso
  onSave: (incident: Incident) => void;
  onClose: () => void;
  currentUser: AppState['currentUser'];
}

const IncidentForm: React.FC<IncidentFormProps> = ({ students, faultTypes, users, courses, onSave, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<IncidentType>('Disciplinaria');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState<Partial<Incident>>({
    date: new Date().toISOString().split('T')[0],
    period: '1',
    follow_up: false,
    observation: '',
    registeredByTeacherId: currentUser?.id || '',
    registeredByTeacherName: currentUser?.name || '',
    faultTypeId: activeTab === 'Disciplinaria' ? (faultTypes[0]?.id || '') : undefined
  });

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.documentId.includes(searchTerm)
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, evidenceBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const user = users.find(u => u.id === userId);
    if (user) {
      setFormData({
        ...formData,
        registeredByTeacherId: user.id,
        registeredByTeacherName: user.name
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert("Debe seleccionar un estudiante");
      return;
    }

    // Resolver el nombre del curso real
    const studentCourse = courses.find(c => c.id === selectedStudent.courseId);
    const courseName = studentCourse ? studentCourse.name : selectedStudent.courseId;

    onSave({
      ...formData as Incident,
      id: Math.random().toString(36).substr(2, 9),
      type: activeTab,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      courseName: courseName,
      faultTypeId: activeTab === 'Disciplinaria' ? formData.faultTypeId : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h2 className="text-xl font-bold z-10">Registrar Incidencia</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors z-10"><X size={20}/></button>
        </div>

        <div className="flex border-b border-slate-100">
          <button
            onClick={() => {
              setActiveTab('Disciplinaria');
              setFormData(prev => ({ ...prev, faultTypeId: faultTypes[0]?.id }));
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 border-b-2 transition-all font-bold ${
              activeTab === 'Disciplinaria' ? 'border-red-600 text-red-600 bg-red-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ClipboardList size={18} />
            <span className="uppercase text-xs tracking-widest">Disciplinaria</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('Académica');
              setFormData(prev => ({ ...prev, faultTypeId: undefined }));
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 border-b-2 transition-all font-bold ${
              activeTab === 'Académica' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen size={18} />
            <span className="uppercase text-xs tracking-widest">Académica</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {!selectedStudent ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Buscar Estudiante</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Nombre o documento..." 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white shadow-sm outline-none transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="mt-2 border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto bg-white shadow-lg">
                {filteredStudents.map(s => {
                  const cName = courses.find(c => c.id === s.courseId)?.name || s.courseId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStudent(s)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-slate-500">{s.documentId}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">CURSO: {cName}</span>
                    </button>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <p className="p-4 text-center text-xs text-slate-400 font-medium">No se encontraron resultados</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-600 p-6 rounded-2xl flex justify-between items-center shadow-lg shadow-blue-200 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
              <div className="z-10">
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest opacity-80 mb-1">Estudiante Seleccionado</p>
                <p className="font-bold text-xl leading-tight">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                <p className="text-xs text-blue-100 font-medium mt-1">ID: {selectedStudent.documentId} | Curso: {courses.find(c => c.id === selectedStudent.courseId)?.name || selectedStudent.courseId}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedStudent(null)}
                className="z-10 text-[10px] bg-white text-blue-600 px-4 py-1.5 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-sm uppercase tracking-wider"
              >
                Cambiar
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Docente Responsable</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <select 
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-bold outline-none transition-all cursor-pointer shadow-sm"
                  value={formData.registeredByTeacherId}
                  onChange={handleTeacherChange}
                >
                  <option value="">Seleccione el docente...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.id === currentUser?.id ? '(Tú)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'Disciplinaria' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Tipo de Falta</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 bg-white text-slate-700 font-medium outline-none transition-all cursor-pointer shadow-sm"
                    value={formData.faultTypeId}
                    onChange={e => setFormData({...formData, faultTypeId: e.target.value})}
                  >
                    {faultTypes.map(f => <option key={f.id} value={f.id}>{f.type}</option>)}
                  </select>
                </div>
                <div className="flex items-center space-x-3 pt-6">
                  <input type="checkbox" id="followUp" checked={formData.follow_up} onChange={e => setFormData({...formData, follow_up: e.target.checked})} className="w-5 h-5 accent-red-600 cursor-pointer" />
                  <label htmlFor="followUp" className="text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer">¿Seguimiento?</label>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Fecha</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-medium outline-none transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Periodo</label>
              <select value={formData.period} onChange={e => setFormData({...formData, period: e.target.value as any})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-medium outline-none transition-all cursor-pointer shadow-sm">
                {PERIODS.map(p => <option key={p} value={p}>Periodo {p}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Observación Detallada</label>
              <textarea required rows={4} value={formData.observation} onChange={e => setFormData({...formData, observation: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-medium outline-none transition-all shadow-sm placeholder:text-slate-300" placeholder="Escriba aquí los hechos..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Evidencia (Opcional)</label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                  <Camera size={18} className="text-slate-400" />
                  <span className="font-bold text-sm">Cargar Imagen</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                {formData.evidenceBase64 && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Cargada</span>}
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end space-x-3">
          <button onClick={onClose} type="button" className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Cancelar</button>
          <button onClick={handleSubmit} type="button" className={`px-8 py-2.5 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg uppercase text-xs tracking-widest active:scale-95 ${activeTab === 'Disciplinaria' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            <Save size={18} />
            <span>Guardar Incidencia</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentForm;
