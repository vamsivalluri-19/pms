import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { NotificationContext } from '../context/NotificationContext.jsx';
import { Bell, Menu, User, Check, Trash2, Calendar, Award, Sun, Moon, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUploadUrl } from '../services/api.js';

const Topbar = ({ toggleSidebar }) => {
  const { user, profile, theme, toggleTheme } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const workspaceName = { STUDENT: 'Career workspace', COMPANY: 'Recruiter studio', PLACEMENT_MANAGER: 'Operations desk', ADMIN: 'System control centre' }[user?.role] || 'Campus Placement Portal';

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 right-0 z-30 flex items-center justify-between w-full h-[72px] px-4 sm:px-6 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_20px_rgba(15,23,42,.025)]">
      {/* Mobile Toggle & Active Workspace Path */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <p className="text-[10px] text-slate-400 font-bold tracking-[.14em] uppercase font-display">{workspaceName}</p>
          <p className="text-sm font-bold text-slate-800 font-display capitalize">Welcome, {profile?.name || user?.email.split('@')[0]}</p>
        </div>
      </div>

      {/* Control Nodes */}
      <div className="flex items-center gap-4 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 hover:text-primary-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notification center */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowProfileDropdown(false);
            }}
            className="p-2.5 text-slate-500 hover:text-primary-500 hover:bg-slate-50 rounded-xl transition-all relative cursor-pointer"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-100 py-2 flex flex-col z-50 animate-pulse-slow">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-800 font-display">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-primary-500 hover:text-primary-600 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto max-h-72">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => markAsRead(notif._id)}
                      className={`flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.isRead ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50 text-blue-500 h-fit">
                        {notif.type.includes('INTERVIEW') ? <Calendar size={14} /> : <Award size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 self-center"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile actions */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifDropdown(false);
            }}
            className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/20 font-display ring-2 ring-white">
              {profile?.photo ? (
                <img src={getUploadUrl(profile.photo)} alt="Avatar" className="h-full w-full object-cover rounded-xl" />
              ) : (
                getInitials(profile?.name || user?.email)
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{profile?.name || user?.email.split('@')[0]}</p>
              <p className="text-[10px] text-slate-400 font-semibold capitalize leading-none mt-0.5">{user?.role.replace('_', ' ').toLowerCase()}</p>
            </div>
          </button>

          {/* Profile Dropdown popover */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 flex flex-col z-50">
              <div className="px-4 py-2.5 border-b border-slate-50">
                <p className="text-xs font-bold text-slate-800">{profile?.name || 'User Account'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                to={
                  user?.role === 'STUDENT' ? '/student/profile' :
                  user?.role === 'COMPANY' ? '/company/profile' :
                  user?.role === 'PLACEMENT_MANAGER' ? '/manager/settings' :
                  '/admin/settings'
                }
                onClick={() => setShowProfileDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <User size={14} />
                My Profile
              </Link>
              <Link
                to={
                  user?.role === 'STUDENT' ? '/student/settings' :
                  user?.role === 'COMPANY' ? '/company/settings' :
                  user?.role === 'PLACEMENT_MANAGER' ? '/manager/settings' :
                  '/admin/settings'
                }
                onClick={() => setShowProfileDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Settings size={14} />
                Account Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
