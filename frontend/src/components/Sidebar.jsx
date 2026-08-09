import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  User,
  FileText,
  FileCheck,
  Briefcase,
  ClipboardList,
  Calendar,
  Award,
  CheckCircle,
  BarChart2,
  History,
  Settings,
  Users,
  ShieldCheck,
  GraduationCap,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  const getMenuOptions = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
          { name: 'Profile', path: '/student/profile', icon: <User size={18} /> },
          { name: 'Resume', path: '/student/resume', icon: <FileText size={18} /> },
          { name: 'Documents', path: '/student/documents', icon: <FileCheck size={18} /> },
          { name: 'Placement Drives', path: '/student/drives', icon: <Briefcase size={18} /> },
          { name: 'Applications', path: '/student/applications', icon: <ClipboardList size={18} /> },
          { name: 'Interviews', path: '/student/interviews', icon: <Calendar size={18} /> },
          { name: 'Results', path: '/student/results', icon: <Award size={18} /> },
          { name: 'Placements', path: '/student/placements', icon: <CheckCircle size={18} /> },
          { name: 'Settings', path: '/student/settings', icon: <Settings size={18} /> }
        ];
      case 'COMPANY':
        return [
          { name: 'Dashboard', path: '/company/dashboard', icon: <LayoutDashboard size={18} /> },
          { name: 'Company Profile', path: '/company/profile', icon: <User size={18} /> },
          { name: 'Jobs', path: '/company/jobs', icon: <Briefcase size={18} /> },
          { name: 'Drives', path: '/company/drives', icon: <GraduationCap size={18} /> },
          { name: 'Applicants', path: '/company/applications', icon: <ClipboardList size={18} /> },
          { name: 'Interviews', path: '/company/interviews', icon: <Calendar size={18} /> },
          { name: 'Results', path: '/company/results', icon: <Award size={18} /> },
          { name: 'Settings', path: '/company/settings', icon: <Settings size={18} /> }
        ];
      case 'PLACEMENT_MANAGER':
        return [
          { name: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard size={18} /> },
          { name: 'Students', path: '/manager/students', icon: <Users size={18} /> },
          { name: 'Companies', path: '/manager/companies', icon: <ShieldCheck size={18} /> },
          { name: 'Jobs', path: '/manager/jobs', icon: <Briefcase size={18} /> },
          { name: 'Drives', path: '/manager/drives', icon: <GraduationCap size={18} /> },
          { name: 'Applications', path: '/manager/applications', icon: <ClipboardList size={18} /> },
          { name: 'Interviews', path: '/manager/interviews', icon: <Calendar size={18} /> },
          { name: 'Placements', path: '/manager/placements', icon: <CheckCircle size={18} /> },
          { name: 'Reports', path: '/manager/reports', icon: <BarChart2 size={18} /> },
          { name: 'Settings', path: '/manager/settings', icon: <Settings size={18} /> }
        ];
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
          { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
          { name: 'Students', path: '/admin/students', icon: <GraduationCap size={18} /> },
          { name: 'Companies', path: '/admin/companies', icon: <ShieldCheck size={18} /> },
          { name: 'Managers', path: '/admin/managers', icon: <ShieldCheck size={18} /> },
          { name: 'Departments', path: '/admin/departments', icon: <Briefcase size={18} /> },
          { name: 'Jobs', path: '/admin/jobs', icon: <Briefcase size={18} /> },
          { name: 'Drives', path: '/admin/drives', icon: <GraduationCap size={18} /> },
          { name: 'Reports', path: '/admin/reports', icon: <BarChart2 size={18} /> },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: <History size={18} /> },
          { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> }
        ];
      default:
        return [];
    }
  };

  const activeStyle = 'flex items-center gap-3.5 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold transition-all duration-200 border-l-4 border-blue-500 rounded-l-none shadow-xs';
  const inactiveStyle = 'flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 font-medium transition-all duration-200';

  return (
    <>
      {/* Mobile Sidebar overlay backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
        ></div>
      )}

      {/* Sidebar scaffolding */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-100 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-800 font-display tracking-tight leading-none block">CAMPUS PLACEMENT</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">TRACKER</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-slate-600 lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Dynamic menu items list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
          {getMenuOptions().map((opt) => (
            <NavLink
              key={opt.name}
              to={opt.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
            >
              {opt.icon}
              <span className="text-xs">{opt.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer logout node */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 font-medium transition-all duration-200 cursor-pointer text-xs"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
