
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut,
  FileText
} from 'lucide-react';
import { LOGO_URL, SCHOOL_NAME } from '../constants';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'incidents', label: 'Incidencias', icon: ClipboardList },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'admin', label: 'Administración', icon: Settings, adminOnly: true },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <img src={LOGO_URL} alt="Logo" className="w-10 h-10 rounded-full bg-white p-1" />
        <div>
          <h1 className="text-lg font-bold leading-none">{SCHOOL_NAME}</h1>
          <p className="text-xs text-slate-400 mt-1">Observador</p>
        </div>
      </div>
      
      <nav className="flex-1 mt-6 px-3 space-y-1">
        {menuItems.map((item) => {
          if (item.adminOnly && currentUser?.role !== 'ADMIN') return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold scale-[1.02]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="mb-4 px-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Sesión Activa</p>
          <p className="text-sm font-bold truncate text-slate-200">{currentUser?.name}</p>
          <p className="text-[10px] text-blue-400 font-bold uppercase">{currentUser?.role}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-bold">Salir del Sistema</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
