
import React, { useState } from 'react';
import { X, User, Users, HeartPulse, History, Star, Phone, MapPin, Calendar, Award, Briefcase, FileDown, Loader2 } from 'lucide-react';
import { Student, Incident } from '../types';
import { generateStudentFilePDF } from '../services/pdfService';
import { dbService } from '../services/dbService';

interface StudentViewProps {
  student: Student;
  courseName: string;
  onClose: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, courseName, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Obtenemos las incidencias frescas antes de generar el PDF
      const allData = await dbService.getAllData();
      const studentIncidents = allData.incidents.filter(i => i.studentId === student.id);
      await generateStudentFilePDF(student, studentIncidents, courseName);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un error al generar el documento PDF.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="z-10 flex items-center space-x-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shadow-lg">
              {student.photoBase64 ? (
                <img src={student.photoBase64} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><User size={40} className="text-white/40" /></div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">{student.firstName} {student.lastName}</h2>
              <div className="flex items-center space-x-3 mt-1 text-slate-300">
                <span className="bg-blue-600/30 text-blue-300 px-3 py-0.5 rounded-full text-xs font-bold border border-blue-500/30">{courseName}</span>
                <span className="text-sm">{student.documentType} {student.documentId}</span>
              </div>
            </div>
          </div>
          
          <div className="z-10 flex items-center space-x-2">
            <button 
              onClick={handlePrint}
              disabled={isPrinting}
              title="Descargar Ficha PDF"
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50"
            >
              {isPrinting ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Descargar Ficha</span>
            </button>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white"><X size={24}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Data */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center space-x-2 mb-4 text-blue-600">
                <User size={20} />
                <h3 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Datos Personales</h3>
              </div>
              <div className="space-y-3">
                <DataField icon={<Calendar size={16}/>} label="Fecha de Nacimiento" value={student.birthDate} />
                <DataField icon={<MapPin size={16}/>} label="Dirección" value={student.studentAddress} />
                <DataField icon={<Phone size={16}/>} label="Teléfono" value={student.studentPhone} />
                <DataField icon={<Award size={16}/>} label="Acudiente" value={`${student.guardianName} (${student.guardianRelationship})`} />
                <DataField icon={<Phone size={16}/>} label="Tel. Acudiente" value={student.guardianPhone} />
                <DataField icon={<Users size={16}/>} label="Hermanos" value={student.siblingCount.toString()} />
              </div>
            </section>

            {/* Medical Data */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center space-x-2 mb-4 text-red-600">
                <HeartPulse size={20} />
                <h3 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Información Médica</h3>
              </div>
              <div className="space-y-3">
                <DataField label="EPS" value={student.eps} />
                <DataField label="Factor RH" value={student.rhFactor} />
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Condiciones Médicas</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.medicalConditions || 'Sin observaciones registradas'}</p>
                </div>
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Formulación Vigente</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.medicalFormulation || 'Sin formulación activa'}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Academic History */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center space-x-2 mb-4 text-emerald-600">
              <History size={20} />
              <h3 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Historial Académico</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Último Colegio" value={student.previousSchool} />
              <DataField label="Grados Reprobados" value={student.failedYears || 'Ninguno'} />
              <div className="md:col-span-2 pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Motivo de Traslado</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.transferReason || 'N/A'}</p>
              </div>
              <div className="md:col-span-2 pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Observaciones Históricas</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{student.historyObservations || 'Sin registros previos'}</p>
              </div>
            </div>
          </section>

          {/* Interests & Life Project */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center space-x-2 mb-4 text-purple-600">
              <Star size={20} />
              <h3 className="font-bold text-slate-800 uppercase text-sm tracking-widest">Intereses y Proyecto de Vida</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Materias de Mayor Agrado</p>
                  <p className="text-sm text-slate-800">{student.favoriteSubjects}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Materias con Dificultad</p>
                  <p className="text-sm text-slate-800">{student.difficultSubjects}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Actividades de Tiempo Libre</p>
                <p className="text-sm text-slate-700 italic">"{student.freeTimeActivities}"</p>
              </div>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center space-x-2 mb-3 text-blue-700">
                  <Briefcase size={18} />
                  <p className="text-xs font-bold uppercase tracking-widest">Proyecto de Vida</p>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">{student.lifeProject}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-white border-t text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Última Actualización: {new Date(student.lastUpdated).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

const DataField: React.FC<{ icon?: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    {icon && <div className="text-slate-400 mt-1">{icon}</div>}
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{label}</p>
      <p className="text-sm text-slate-800 font-semibold">{value || '---'}</p>
    </div>
  </div>
);

export default StudentView;
