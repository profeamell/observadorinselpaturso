
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentForm from './components/StudentForm';
import StudentView from './components/StudentView';
import IncidentForm from './components/IncidentForm';
import AdminPanel from './components/AdminPanel';
import ReportsPanel from './components/ReportsPanel';
import { 
  Plus, Trash2, Edit, AlertTriangle, Eye, Loader2, RefreshCw, Search, ClipboardList, BookOpen
} from 'lucide-react';
import { AppState, Student, Incident } from './types';
import { INITIAL_DATA } from './services/mockData';
import { LOGO_URL } from './constants';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [data, setData] = useState<AppState>({ ...INITIAL_DATA, teachers: [], groupAssignments: [], currentUser: null });
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showStudentView, setShowStudentView] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [viewingStudent, setViewingStudent] = useState<Student | undefined>();
  
  const [studentSearch, setStudentSearch] = useState('');
  const [incidentSearch, setIncidentSearch] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const initInProgress = useRef(false);

  const initApp = useCallback(async () => {
    if (initInProgress.current) return;
    initInProgress.current = true;

    try {
      setLoading(true);
      setDbError(null);
      
      console.log('App: Conectando...');
      await dbService.setup();
      
      const remoteData = await dbService.getAllData();
      
      setData(prev => ({
        ...prev,
        users: remoteData.users,
        teachers: remoteData.teachers,
        students: remoteData.students,
        incidents: remoteData.incidents,
        courses: remoteData.courses,
        faultTypes: remoteData.faultTypes,
        groupAssignments: remoteData.groupAssignments
      }));
      
      setLoading(false);
    } catch (err: any) {
      console.error('App Error:', err);
      setDbError(err.message || 'Error de conexión.');
      setLoading(false);
    } finally {
      initInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const user = await dbService.login(loginForm.username, loginForm.password);
      if (user) {
        setData(prev => ({ ...prev, currentUser: user }));
      } else {
        setLoginError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setLoginError('Error al validar acceso.');
    }
  };

  const saveStudent = async (student: Student) => {
    try {
      const directorUser = data.users.find(u => u.courseId === student.courseId);
      if (directorUser) {
        student.directorId = directorUser.id;
      }
      
      const saved = await dbService.saveStudent(student);
      setData(prev => ({
        ...prev,
        students: prev.students.find(s => s.id === saved.id) 
          ? prev.students.map(s => s.id === saved.id ? saved : s)
          : [saved, ...prev.students]
      }));
    } catch (err) { alert("Error al guardar."); }
    setShowStudentForm(false);
  };

  const saveIncident = async (incident: Incident) => {
    try {
      const saved = await dbService.saveIncident(incident);
      setData(prev => ({ ...prev, incidents: [saved, ...prev.incidents] }));
    } catch (err) { alert("Error al registrar."); }
    setShowIncidentForm(false);
  };

  const deleteStudent = async (id: string) => {
    const student = data.students.find(s => s.id === id);
    if (!student) return;

    // Lógica de autorización
    const isAdmin = data.currentUser?.role === 'ADMIN';
    const isDirector = data.currentUser?.role === 'TEACHER' && data.currentUser?.courseId === student.courseId;

    if (!isAdmin && !isDirector) {
      alert("No está autorizado para eliminar este estudiante. Solo el administrador o el director de grupo asignado tienen este permiso.");
      return;
    }

    if (!confirm('¿Borrar definitivamente este estudiante y todo su historial?')) return;
    try {
      await dbService.deleteStudent(id);
      setData(prev => ({ ...prev, students: prev.students.filter(s => s.id !== id) }));
    } catch (err) { alert("Error al eliminar."); }
  };

  const deleteIncident = async (id: string) => {
    const incident = data.incidents.find(i => i.id === id);
    if (!incident) return;

    const student = data.students.find(s => s.id === incident.studentId);
    
    // Lógica de autorización
    const isAdmin = data.currentUser?.role === 'ADMIN';
    // Si el estudiante no existe (huérfano), solo el admin puede borrar
    const isDirector = student && data.currentUser?.role === 'TEACHER' && data.currentUser?.courseId === student.courseId;

    if (!isAdmin && !isDirector) {
      alert("No está autorizado para eliminar esta incidencia. Solo el administrador o el director de grupo asignado tienen este permiso.");
      return;
    }

    if (!confirm('¿Borrar definitivamente este registro de incidencia?')) return;
    try {
      await dbService.deleteIncident(id);
      setData(prev => ({ ...prev, incidents: prev.incidents.filter(i => i.id !== id) }));
    } catch (err) { alert("Error al eliminar incidencia."); }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900 mb-4" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Iniciando INSELPA...</p>
      </div>
    );
  }

  if (dbError && !data.currentUser) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-6">
        <AlertTriangle className="text-slate-900 mb-4" size={48} />
        <h2 className="text-xl font-black text-slate-900 uppercase mb-2">Error de Conexión</h2>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">{dbError}</p>
        <button onClick={() => initApp()} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  if (!data.currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden">
          <div className="p-12 text-center pb-6">
            <img src={LOGO_URL} alt="Logo" className="w-24 h-24 mx-auto mb-6 drop-shadow-md" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">INSELPA</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Observador Digital</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="p-10 pt-4 space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Usuario</label>
              <input 
                required 
                type="text" 
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm" 
                value={loginForm.username} 
                onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
                placeholder="Identificación" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Contraseña</label>
              <input 
                required 
                type="password" 
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm" 
                value={loginForm.password} 
                onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                placeholder="••••••••" 
              />
            </div>
            {loginError && (
              <div className="bg-red-50 text-red-600 text-[10px] font-black uppercase text-center py-3 rounded-xl">
                {loginError}
              </div>
            )}
            <button 
              type="submit" 
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-100 active:scale-[0.98]"
            >
              Iniciar Sesión
            </button>
          </form>
          <div className="pb-10 text-center">
             <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.3em]">Autenticación Segura Institucional</p>
          </div>
        </div>
      </div>
    );
  }

  const getCourseName = (id: string) => data.courses.find(c => c.id === id)?.name || id;

  const refreshAppData = async () => {
    try {
      const remoteData = await dbService.getAllData();
      setData(prev => ({
        ...prev,
        users: remoteData.users,
        teachers: remoteData.teachers,
        students: remoteData.students,
        incidents: remoteData.incidents,
        courses: remoteData.courses,
        faultTypes: remoteData.faultTypes,
        groupAssignments: remoteData.groupAssignments
      }));
    } catch (e) {
      console.error("Refresh Error:", e);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={data.currentUser} onLogout={() => setData(prev => ({...prev, currentUser: null}))} />
      <main className="flex-1 ml-64 p-10">
        <header className="mb-10 flex justify-between items-center">
           <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bienvenido</h2>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">Hola, {data.currentUser.name}</p>
           </div>
           <button onClick={refreshAppData} className="p-3 text-slate-400 hover:text-blue-600 bg-white rounded-2xl border border-slate-200 transition-all shadow-sm active:rotate-180 duration-500">
             <RefreshCw size={20} />
           </button>
        </header>

        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Estudiantes</h3>
              <button onClick={() => { setEditingStudent(undefined); setShowStudentForm(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 text-[10px] uppercase tracking-widest">
                <Plus size={16} />
                <span>Nuevo Estudiante</span>
              </button>
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center pr-4">
              <Search className="ml-4 text-slate-300" size={18} />
              <input type="text" placeholder="Buscar por nombre o documento..." className="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase())).map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900 uppercase text-sm">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{student.documentId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">{getCourseName(student.courseId)}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => { setViewingStudent(student); setShowStudentView(true); }} className="p-2 text-slate-400 hover:text-blue-600" title="Ver ficha integral"><Eye size={18} /></button>
                        <button onClick={() => { setEditingStudent(student); setShowStudentForm(true); }} className="p-2 text-slate-400 hover:text-amber-600" title="Editar datos"><Edit size={18} /></button>
                        <button onClick={() => deleteStudent(student.id)} className="p-2 text-slate-400 hover:text-red-600" title="Eliminar registro"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Incidencias</h3>
              <button onClick={() => setShowIncidentForm(true)} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all">
                <Plus size={16} />
                <span>Registrar Incidencia</span>
              </button>
            </div>
            
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center pr-4">
              <Search className="ml-4 text-slate-300" size={18} />
              <input type="text" placeholder="Buscar por nombre del estudiante..." className="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300" value={incidentSearch} onChange={e => setIncidentSearch(e.target.value)} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalles</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.incidents
                    .filter(i => i.studentName.toLowerCase().includes(incidentSearch.toLowerCase()))
                    .map(incident => (
                    <tr key={incident.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900 uppercase text-sm">{incident.studentName}</p>
                        <p className="text-[10px] text-blue-600 font-bold uppercase">Curso: {incident.courseName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 mb-1">
                          {incident.type === 'Disciplinaria' ? <ClipboardList size={14} className="text-red-500" /> : <BookOpen size={14} className="text-emerald-500" />}
                          <span className={`text-[10px] font-black uppercase ${incident.type === 'Disciplinaria' ? 'text-red-600' : 'text-emerald-600'}`}>{incident.type}</span>
                        </div>
                        <p className="text-xs text-slate-500 italic line-clamp-1">"{incident.observation}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{incident.date}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase">Periodo {incident.period}</p>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => {
                          const student = data.students.find(s => s.id === incident.studentId);
                          if (student) {
                            setViewingStudent(student);
                            setShowStudentView(true);
                          }
                        }} className="p-2 text-slate-400 hover:text-blue-600" title="Ver ficha del estudiante"><Eye size={18} /></button>
                        <button onClick={() => deleteIncident(incident.id)} className="p-2 text-slate-400 hover:text-red-600" title="Eliminar registro"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {data.incidents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <AlertTriangle className="text-slate-200 mb-2" size={40} />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No hay incidencias registradas</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'reports' && (
          <ReportsPanel data={data} />
        )}
        {activeTab === 'admin' && (
          <AdminPanel data={data} refreshData={refreshAppData} />
        )}
      </main>

      {showStudentView && viewingStudent && <StudentView student={viewingStudent} courseName={getCourseName(viewingStudent.courseId)} onClose={() => setShowStudentView(false)} />}
      {showStudentForm && <StudentForm student={editingStudent} courses={data.courses} currentUser={data.currentUser} onSave={saveStudent} onClose={() => setShowStudentForm(false)} />}
      {showIncidentForm && <IncidentForm students={data.students} faultTypes={data.faultTypes} users={data.users} currentUser={data.currentUser} onSave={saveIncident} onClose={() => setShowIncidentForm(false)} />}
    </div>
  );
};

export default App;
