
import React from 'react';
import { 
  X, Calendar, User, BookOpen, ClipboardList, UserCheck, 
  Image as ImageIcon, CheckCircle2, AlertCircle, Hash, 
  Clock, Bookmark, Fingerprint, Info, MessageSquare, ShieldAlert
} from 'lucide-react';
import { Incident, FaultType } from '../types';

interface IncidentViewProps {
  incident: Incident;
  faultTypes: FaultType[];
  onClose: () => void;
}

const IncidentView: React.FC<IncidentViewProps> = ({ incident, faultTypes, onClose }) => {
  const faultTypeName = faultTypes.find(f => f.id === incident.faultTypeId)?.type || 'General / No especificada';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in duration-300 border border-slate-100">
        
        {/* Cabecera Estilo Acta Institucional */}
        <div className={`p-10 text-white relative overflow-hidden ${
          incident.type === 'Disciplinaria' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center space-x-5">
              <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-xl border border-white/30 shadow-inner">
                {incident.type === 'Disciplinaria' ? <ClipboardList size={32} /> : <BookOpen size={32} />}
              </div>
              <div>
                <div className="flex items-center space-x-2 opacity-80 mb-1">
                  <Fingerprint size={12} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Registro de Novedad</p>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{incident.type}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all hover:rotate-90 duration-300">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="p-10 overflow-y-auto max-h-[75vh] space-y-8 bg-slate-50/30">
          
          {/* Fila 1: Estudiante y Contexto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                <User size={28} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estudiante Registrado</p>
                <p className="font-black text-slate-900 uppercase text-lg leading-tight">{incident.studentName}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Curso {incident.courseName}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {incident.studentId}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha Evento</span>
                <Calendar size={14} className="text-slate-300" />
              </div>
              <p className="font-black text-slate-900 text-base">{incident.date}</p>
              <p className="text-[10px] text-blue-600 font-black uppercase mt-1">Periodo Académico {incident.period}</p>
            </div>
          </div>

          {/* Fila 2: Clasificación y Seguimiento - SOLO PARA DISCIPLINARIAS */}
          {incident.type === 'Disciplinaria' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <Bookmark className="text-slate-400" size={20} />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Falta / Novedad</p>
                  <p className="text-sm font-black text-slate-800 uppercase">{faultTypeName}</p>
                </div>
              </div>
              <div className={`p-5 rounded-2xl border flex items-center space-x-4 ${
                incident.follow_up 
                  ? 'bg-amber-50 border-amber-100 text-amber-700 shadow-sm shadow-amber-50' 
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}>
                {incident.follow_up ? <ShieldAlert size={20} className="animate-pulse" /> : <CheckCircle2 size={20} />}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Estado de Seguimiento</p>
                  <p className="text-sm font-black uppercase">
                    {incident.follow_up ? 'Requiere Atención Continua' : 'Caso Cerrado / Informativo'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bloque: Observación Detallada */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-900/10"></div>
            <div className="flex items-center space-x-3 mb-6 text-slate-900">
              <MessageSquare size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Observación y Relato de los Hechos</span>
            </div>
            <div className="relative z-10">
              <p className="text-slate-700 leading-relaxed font-semibold text-lg italic pr-4">
                "{incident.observation}"
              </p>
            </div>
          </div>

          {/* Bloque: Evidencia Visual (Visible en ambas) */}
          {incident.evidenceBase64 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-700">
              <div className="flex items-center space-x-3 mb-6 text-slate-900">
                <ImageIcon size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Pruebas y Evidencias</span>
              </div>
              <div className="rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-md group relative bg-slate-100">
                <img src={incident.evidenceBase64} alt="Prueba visual del incidente" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                  Evidencia Adjunta
                </div>
              </div>
            </div>
          )}

          {/* Responsable Final */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between shadow-xl gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/20">
                <UserCheck size={32} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Docente Responsable</p>
                <p className="text-xl font-bold uppercase tracking-tight">{incident.registeredByTeacherName}</p>
              </div>
            </div>
            <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <div className="flex items-center justify-center md:justify-end space-x-2 text-emerald-400">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Documento Firmado Digitalmente</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center pt-4 opacity-30">
             <div className="flex items-center space-x-4">
                <Info size={12} />
                <span className="text-[8px] font-black uppercase tracking-[0.4em]">INSELPA - SISTEMA DE CONTROL DISCIPLINARIO</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentView;
