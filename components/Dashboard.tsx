import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, AlertCircle, Calendar, GraduationCap } from 'lucide-react';
import { AppState } from '../types';
import { SCHOOL_NAME } from '../constants';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<{ data: AppState }> = ({ data }) => {
  const { students, incidents, courses } = data;

  const totalStudents = students.length;
  const totalIncidents = incidents.length;
  const disciplinaryIncidents = incidents.filter(i => i.type === 'Disciplinaria').length;
  const academicIncidents = incidents.filter(i => i.type === 'Académica').length;

  const studentsPerCourse = courses.map(c => ({
    name: c.name,
    count: students.filter(s => s.courseId === c.id).length
  }));

  const incidentsByPeriod = ['1', '2', '3', '4'].map(p => ({
    name: `P${p}`,
    count: incidents.filter(i => i.period === p).length
  }));

  const incidentsByType = [
    { name: 'Disciplinaria', value: disciplinaryIncidents },
    { name: 'Académica', value: academicIncidents }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-blue-500" />} label="Total Estudiantes" value={totalStudents} bgColor="bg-blue-50" borderColor="border-blue-100" />
        <StatCard icon={<AlertCircle className="text-red-500" />} label="Incidencias Totales" value={totalIncidents} bgColor="bg-red-50" borderColor="border-red-100" />
        <StatCard icon={<Calendar className="text-amber-500" />} label="Disciplinarias" value={disciplinaryIncidents} bgColor="bg-amber-50" borderColor="border-amber-100" />
        <StatCard icon={<GraduationCap className="text-emerald-500" />} label="Académicas" value={academicIncidents} bgColor="bg-emerald-50" borderColor="border-emerald-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Estudiantes por Curso</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsPerCourse}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                <YAxis fontSize={10} fontWeight="bold" />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Incidencias por Periodo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsByPeriod}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                <YAxis fontSize={10} fontWeight="bold" />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, bgColor: string, borderColor: string }> = ({ icon, label, value, bgColor, borderColor }) => (
  <div className={`bg-white p-6 rounded-3xl border ${borderColor} shadow-sm flex items-center space-x-4`}>
    <div className={`p-3 rounded-2xl ${bgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default Dashboard;