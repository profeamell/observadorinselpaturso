
import React, { useState } from 'react';
import { Trash2, Plus, ShieldAlert, X, Edit, UserCircle, GraduationCap, Briefcase, BookOpen, Key, Loader2, RefreshCw, UserCheck } from 'lucide-react';
import { AppState, User, UserRole, Teacher, Course, FaultType, GroupAssignment } from '../types';
import { dbService } from '../services/dbService';

interface AdminPanelProps {
  data: AppState;
  refreshData: () => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ data, refreshData }) => {
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [showModal, setShowModal] = useState<'user' | 'teacher' | 'course' | 'fault' | 'assignment' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', username: '', role: 'TEACHER', password: '' });
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({ name: '', document_id: '' });
  const [newCourse, setNewCourse] = useState<Partial<Course>>({ name: '' });
  const [newFault, setNewFault] = useState<Partial<FaultType>>({ type: 'Tipo1' });
  const [newAssignment, setNewAssignment] = useState({ courseId: '', teacherId: '' });

  const resetUserForm = () => {
    setNewUser({ name: '', username: '', role: 'TEACHER', password: '' });
    setEditingId(null);
  };

  const handleEditUser = (user: User) => {
    setNewUser({ ...user, password: '' });
    setEditingId(user.id);
    setShowModal('user');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username) return;
    
    setIsProcessing(true);
    try {
      const user: User = {
        id: editingId || Math.random().toString(36).substr(2, 9),
        name: newUser.name!,
        username: newUser.username!,
        role: newUser.role as UserRole,
        password: newUser.password || '123'
      };
      
      await dbService.saveUser(user);
      resetUserForm();
      setShowModal(null);
      await refreshData();
    } catch (err: any) {
      alert("Error al guardar usuario: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name) return;
    setIsProcessing(true);
    try {
      const teacher: Teacher = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTeacher.name!,
        document_id: newTeacher.document_id || ''
      };
      await dbService.saveTeacher(teacher);
      setNewTeacher({ name: '', document_id: '' });
      setShowModal(null);
      await refreshData();
    } catch (err: any) {
      alert("Error al guardar docente: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name) return;
    setIsProcessing(true);
    try {
      const course: Course = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCourse.name!
      };
      await dbService.saveCourse(course);
      setNewCourse({ name: '' });
      setShowModal(null);
      await refreshData();
    } catch (err: any) {
      alert("Error al crear curso: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveFault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFault.type) return;
    setIsProcessing(true);
    try {
      const fault: FaultType = {
        id: Math.random().toString(36).substr(2, 9),
        type: newFault.type as any
      };
      await dbService.saveFaultType(fault);
      setNewFault({ type: 'Tipo1' });
      setShowModal(null);
      await refreshData();
    } catch (err: any) {
      alert("Error al guardar tipo de falta: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.courseId || !newAssignment.teacherId) return;
    setIsProcessing(true);
    try {
      await dbService.saveGroupAssignment(newAssignment.courseId, newAssignment.teacherId);
      setNewAssignment({ courseId: '', teacherId: '' });
      setShowModal(null);
      await refreshData();
    } catch (err: any) {
      alert("Error al asignar director: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteItem = async (type: 'user' | 'teacher' | 'course' | 'fault' | 'assignment', id: string) => {
    if (!id) return;
    
    if (type === 'user' && id === 'u1') {
      alert("El administrador principal no puede ser eliminado.");
      return;
    }

    const labels = { user: 'usuario', teacher: 'docente', course: 'curso', fault: 'tipo de falta', assignment: 'asignación de director' };
    if (!confirm(`¿Confirmar eliminación permanente de este ${labels[type]}?`)) return;

    setIsProcessing(true);
    try {
      if (type === 'user') await dbService.deleteUser(id);
      else if (type === 'teacher') await dbService.deleteTeacher(id);
      else if (type === 'course') await dbService.deleteCourse(id);
      else if (type === 'fault') await dbService.deleteFaultType(id);
      else if (type === 'assignment') await dbService.deleteGroupAssignment(id);
      
      await new Promise(r => setTimeout(r, 500));
      await refreshData();
    } catch (err: any) {
      if (err.message?.includes('FOREIGN KEY') || err.message?.includes('constraint')) {
        alert("ERROR: No se puede eliminar. Este elemento está vinculado a otros datos.");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetIncidents = async () => {
    if (confirm("ADVERTENCIA CRÍTICA: Se borrarán todas las incidencias. ¿Continuar?")) {
      setIsProcessing(true);
      try {
        await dbService.clearAllIncidents();
        await refreshData();
        alert("Incidencias eliminadas.");
      } catch (err: any) {
        alert("Error: " + err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative ${isProcessing ? 'cursor-wait' : ''}`}>
      {isProcessing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] flex items-center space-x-4 shadow-2xl">
            <Loader2 className="animate-spin text-blue-400" size={24} />
            <span className="font-black uppercase text-[11px] tracking-widest">Sincronizando...</span>
          </div>
        </div>
      )}

      <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto scrollbar-hide">
        <TabButton active={activeSubTab === 'users'} onClick={() => setActiveSubTab('users')}>Usuarios</TabButton>
        <TabButton active={activeSubTab === 'teachers'} onClick={() => setActiveSubTab('teachers')}>Docentes</TabButton>
        <TabButton active={activeSubTab === 'courses'} onClick={() => setActiveSubTab('courses')}>Cursos</TabButton>
        <TabButton active={activeSubTab === 'directors'} onClick={() => setActiveSubTab('directors')}>Directores</TabButton>
        <TabButton active={activeSubTab === 'faults'} onClick={() => setActiveSubTab('faults')}>Tipos Faltas</TabButton>
        <TabButton active={activeSubTab === 'reset'} onClick={() => setActiveSubTab('reset')} color="text-red-500">Mantenimiento</TabButton>
      </div>

      <div className="p-10">
        {activeSubTab === 'users' && (
          <ManagementSection title="Usuarios" onAdd={() => { resetUserForm(); setShowModal('user'); }} items={data.users} headers={['Nombre / Login', 'Rol', 'Acciones']} renderRow={(user: User) => (
            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4"><p className="font-bold text-slate-800 text-sm">{user.name}</p><p className="text-[10px] text-slate-400 font-black uppercase">@{user.username}</p></td>
              <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>{user.role}</span></td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => handleEditUser(user)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={18}/></button>
                {user.id !== 'u1' && <button onClick={() => deleteItem('user', user.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>}
              </td>
            </tr>
          )} />
        )}

        {activeSubTab === 'teachers' && (
          <ManagementSection title="Docentes" onAdd={() => setShowModal('teacher')} items={data.teachers} headers={['Nombre Docente', 'Acción']} renderRow={(t: Teacher) => (
            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4"><p className="font-bold text-slate-800 text-sm">{t.name}</p><p className="text-[10px] text-slate-400 font-black uppercase">CC: {t.document_id || '---'}</p></td>
              <td className="px-6 py-4 text-right"><button onClick={() => deleteItem('teacher', t.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button></td>
            </tr>
          )} />
        )}

        {activeSubTab === 'courses' && (
          <ManagementSection title="Cursos" onAdd={() => setShowModal('course')} items={data.courses} headers={['Curso', 'Acción']} renderRow={(c: Course) => (
            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4"><p className="font-bold text-slate-800 text-sm">{c.name}</p></td>
              <td className="px-6 py-4 text-right"><button onClick={() => deleteItem('course', c.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button></td>
            </tr>
          )} />
        )}

        {activeSubTab === 'directors' && (
          <ManagementSection title="Directores de Grupo" onAdd={() => setShowModal('assignment')} items={data.groupAssignments} headers={['Curso', 'Director Asignado', 'Acción']} renderRow={(a: GroupAssignment) => (
            <tr key={a.courseId} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4"><span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black">{a.courseName}</span></td>
              <td className="px-6 py-4"><p className="font-bold text-slate-800 text-sm">{a.teacherName}</p></td>
              <td className="px-6 py-4 text-right"><button onClick={() => deleteItem('assignment', a.courseId)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button></td>
            </tr>
          )} />
        )}

        {activeSubTab === 'faults' && (
          <ManagementSection title="Faltas" onAdd={() => setShowModal('fault')} items={data.faultTypes} headers={['Categoría', 'Acción']} renderRow={(f: FaultType) => (
            <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4"><p className="font-bold text-slate-800 text-sm">{f.type}</p></td>
              <td className="px-6 py-4 text-right"><button onClick={() => deleteItem('fault', f.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button></td>
            </tr>
          )} />
        )}

        {activeSubTab === 'reset' && (
          <div className="max-w-md mx-auto py-10 text-center">
            <ShieldAlert className="text-red-500 mx-auto mb-6" size={48} />
            <h3 className="text-xl font-black text-slate-900 uppercase mb-4">Zona de Peligro</h3>
            <button onClick={handleResetIncidents} className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700">Reiniciar Incidencias</button>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Administrar" onClose={() => setShowModal(null)}>
          {showModal === 'user' && (
            <form onSubmit={handleSaveUser} className="space-y-4">
              <InputField label="Nombre" value={newUser.name} onChange={v => setNewUser({...newUser, name: v})} />
              <InputField label="Login" value={newUser.username} onChange={v => setNewUser({...newUser, username: v})} />
              <InputField label="Password" type="password" value={newUser.password} onChange={v => setNewUser({...newUser, password: v})} />
              <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                <option value="TEACHER">DOCENTE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <SubmitButton label="Guardar" isProcessing={isProcessing} />
            </form>
          )}
          {showModal === 'assignment' && (
            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Seleccionar Curso</label>
                <select required className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-sm" value={newAssignment.courseId} onChange={e => setNewAssignment({...newAssignment, courseId: e.target.value})}>
                  <option value="">Elegir...</option>
                  {data.courses.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Seleccionar Docente</label>
                <select required className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-sm" value={newAssignment.teacherId} onChange={e => setNewAssignment({...newAssignment, teacherId: e.target.value})}>
                  <option value="">Elegir...</option>
                  {data.teachers.map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>)}
                </select>
              </div>
              <SubmitButton label="Asignar Director" isProcessing={isProcessing} />
            </form>
          )}
          {showModal === 'teacher' && (
            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <InputField label="Nombre" value={newTeacher.name} onChange={v => setNewTeacher({...newTeacher, name: v})} />
              <InputField label="Documento" value={newTeacher.document_id} onChange={v => setNewTeacher({...newTeacher, document_id: v})} />
              <SubmitButton label="Guardar" isProcessing={isProcessing} />
            </form>
          )}
          {showModal === 'course' && (
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <InputField label="Curso" value={newCourse.name} onChange={v => setNewCourse({...newCourse, name: v})} />
              <SubmitButton label="Guardar" isProcessing={isProcessing} />
            </form>
          )}
          {showModal === 'fault' && (
            <form onSubmit={handleSaveFault} className="space-y-4">
              <InputField label="Falta" value={newFault.type} onChange={v => setNewFault({...newFault, type: v as any})} />
              <SubmitButton label="Guardar" isProcessing={isProcessing} />
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode, color?: string }> = ({ active, onClick, children, color }) => (
  <button onClick={onClick} className={`px-8 py-5 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${active ? 'border-blue-600 text-blue-600 bg-white' : `border-transparent ${color || 'text-slate-400'} hover:bg-slate-100`}`}>
    {children}
  </button>
);

const ManagementSection: React.FC<{ title: string, onAdd: () => void, items: any[], renderRow: (item: any) => React.ReactNode, headers: string[] }> = ({ title, onAdd, items, renderRow, headers }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
      <button onClick={onAdd} className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95">
        <Plus size={16} /> <span>Nuevo</span>
      </button>
    </div>
    <div className="border rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr>{headers.map(h => <th key={h} className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${h === 'Acción' || h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">{items.map(item => renderRow(item))}</tbody>
      </table>
    </div>
  </div>
);

const Modal: React.FC<{ title: string, onClose: () => void, children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
      <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
        <h2 className="text-lg font-black uppercase tracking-widest">{title}</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
      </div>
      <div className="p-10">{children}</div>
    </div>
  </div>
);

const InputField: React.FC<{ label: string, placeholder?: string, value?: string, onChange: (v: string) => void, type?: string }> = ({ label, placeholder, value, onChange, type = 'text' }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
    <input required type={type} placeholder={placeholder} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" value={value || ''} onChange={e => onChange(e.target.value)} />
  </div>
);

const SubmitButton: React.FC<{ label: string, isProcessing: boolean }> = ({ label, isProcessing }) => (
  <button type="submit" disabled={isProcessing} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2">
    {isProcessing && <Loader2 className="animate-spin" size={16} />}
    <span>{label}</span>
  </button>
);

export default AdminPanel;
