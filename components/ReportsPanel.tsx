
import React, { useState } from 'react';
import { FileDown, Calendar, Filter, Search, User, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { AppState, Incident, Student } from '../types';
import { generateDateRangeReportPDF, generateStudentFilePDF } from '../services/pdfService';

interface ReportsPanelProps {
  data: AppState;
}

const ReportsPanel: React.FC<ReportsPanelProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'consolidated' | 'individual'>('consolidated');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredIncidents = data.incidents.filter(incident => {
    const incidentDate = incident.date;
    return incidentDate >= startDate && incidentDate <= endDate;
  });

  const filteredStudents = data.students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.documentId.includes(studentSearch)
  ).slice(0, 5);

  const handleGenerateConsolidated = async () => {
    if (filteredIncidents.length === 0) {
      alert("No hay incidencias en el rango de fechas seleccionado.");
      return;
    }
    setIsGenerating(true);
    try {
      await generateDateRangeReportPDF(filteredIncidents, startDate, endDate);
    } catch (error) {
      alert("Error al generar el reporte.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateIndividual = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    try {
      const studentIncidents = data.incidents.filter(i => i.studentId === selectedStudent.id);
      const courseName = data.courses.find(c => c.id === selectedStudent.courseId)?.name || 'N/A';
      await generateStudentFilePDF(selectedStudent, studentIncidents, courseName);
    } catch (error) {
      alert("Error al generar la ficha.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('consolidated')}
          className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'consolidated' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Reporte Consolidado
        </button>
        <button 
          onClick={() => setActiveTab('individual')}
          className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Ficha Individual
        </button>
      </div>

      {activeTab === 'consolidated' ? (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Inicial</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="date" 
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Final</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="date" 
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <button 
                disabled={isGenerating || filteredIncidents.length === 0}
                onClick={handleGenerateConsolidated}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-100 disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
                <span>Descargar Consolidado</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Vista Previa del Consolidado</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">
                  {filteredIncidents.length} incidencias encontradas en este periodo
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante / Curso</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha / Tipo</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredIncidents.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-black text-slate-900 text-sm uppercase">{i.studentName}</p>
                        <p className="text-[10px] font-black text-blue-600 uppercase">CURSO: {i.courseName}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-700">{i.date}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                          i.type === 'Disciplinaria' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {i.type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs text-slate-500 line-clamp-2 italic">"{i.observation}"</p>
                      </td>
                    </tr>
                  ))}
                  {filteredIncidents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-black uppercase text-xs tracking-widest opacity-30">
                        No hay datos para mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 max-w-2xl mx-auto text-center space-y-8">
           <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
              <User className="text-blue-600" size={32} />
           </div>
           <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Reporte por Estudiante</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Genera la ficha integral con todo el historial</p>
           </div>

           <div className="relative text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Seleccionar Estudiante</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm text-black placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900/5 transition-all shadow-sm"
                  placeholder="Nombre o identificación..."
                  value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setSelectedStudent(null); }}
                />
              </div>

              {studentSearch && !selectedStudent && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden divide-y divide-slate-50">
                   {filteredStudents.map(s => (
                     <button 
                       key={s.id} 
                       onClick={() => { setSelectedStudent(s); setStudentSearch(`${s.firstName} ${s.lastName}`); }}
                       className="w-full p-4 hover:bg-slate-50 text-left flex justify-between items-center transition-colors"
                     >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{s.firstName} {s.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{s.documentId}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                     </button>
                   ))}
                </div>
              )}
           </div>

           {selectedStudent && (
             <div className="p-6 bg-slate-900 text-white rounded-[2rem] flex items-center justify-between shadow-xl animate-in zoom-in duration-300">
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Estudiante Confirmado</p>
                  <p className="text-lg font-bold leading-none">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase mt-1">CURSO: {data.courses.find(c => c.id === selectedStudent.courseId)?.name}</p>
                </div>
                <button 
                  onClick={handleGenerateIndividual}
                  disabled={isGenerating}
                  className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
                  <span>Generar Ficha PDF</span>
                </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ReportsPanel;
