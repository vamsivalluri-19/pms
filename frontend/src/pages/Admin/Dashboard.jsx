import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import { Button, LoadingSpinner, Badge, EmptyState, Input, Select } from '../../components/UI.jsx';
import {
  Users,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  History,
  Terminal,
  Settings,
  UserCheck,
  UserX,
  Trash2,
  PlusCircle,
  BookOpen,
  Save,
  Database,
  Lock,
  Bell,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Globe,
  Award
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin/users' || path === '/admin/students' || path === '/admin/companies' || path === '/admin/managers') {
      setActiveTab('users');
    } else if (path === '/admin/departments') {
      setActiveTab('academic');
    } else if (path === '/admin/settings') {
      setActiveTab('settings');
    } else if (path === '/admin/jobs' || path === '/admin/drives') {
      setActiveTab('jobs-drives');
    } else if (path === '/admin/reports') {
      setActiveTab('reports');
    } else if (path === '/admin/audit-logs') {
      setActiveTab('audit-logs');
    } else {
      setActiveTab('overview');
    }
  }, [location]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Users Management State
  const [usersList, setUsersList] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState([]);

  const getFilteredUsers = () => {
    const path = location.pathname;
    if (path === '/admin/students') {
      return usersList.filter(u => u.role === 'STUDENT');
    }
    if (path === '/admin/companies') {
      return usersList.filter(u => u.role === 'COMPANY');
    }
    if (path === '/admin/managers') {
      return usersList.filter(u => u.role === 'PLACEMENT_MANAGER');
    }
    return usersList; // Shows all users for /admin/users or default dashboard path
  };

  const getUserTabTitle = () => {
    const path = location.pathname;
    if (path === '/admin/students') return 'Student Login Accounts';
    if (path === '/admin/companies') return 'Recruiter Login Accounts';
    if (path === '/admin/managers') return 'Placement Manager Accounts';
    return 'User Logins';
  };
  
  // Academic Configurator State
  const [academicData, setAcademicData] = useState({ departments: [], courses: [], batches: [] });
  const [academicType, setAcademicType] = useState('department');
  const [nameVal, setNameVal] = useState('');
  const [codeVal, setCodeVal] = useState('');
  const [durationVal, setDurationVal] = useState('4');
  const [startYearVal, setStartYearVal] = useState('');
  const [endYearVal, setEndYearVal] = useState('');

  // System Settings State
  const [sysSettings, setSysSettings] = useState({
    institutionName: 'PlaceTrack Institutional Control Centre',
    adminEmail: 'admin@institution.edu',
    allowStudentRegistration: true,
    allowRecruiterRegistration: true,
    requireRecruiterApproval: true,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    enable2FA: false,
    strictPasswordPolicy: true,
    emailNotificationsEnabled: true,
    systemAnnouncement: 'Placement Drive Season 2026 is active. Ensure all student profiles are updated.',
    minCgpaDefault: 6.5,
    maxBacklogsDefault: 0,
    maxOffersPerStudent: 2,
    autoBackupSchedule: 'Daily (02:00 AM)',
    maintenanceMode: false
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [maintActionLoading, setMaintActionLoading] = useState(null);

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/stats/admin');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      const logsRes = await api.get('/audit-logs');
      if (logsRes.data.success) {
        setLogs(logsRes.data.logs);
      }

      // Fetch user logins
      const usersRes = await api.get('/auth/users');
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }

      // Fetch academic configurator listings
      const academicRes = await api.get('/academic-settings');
      if (academicRes.data.success) {
        setAcademicData({
          departments: academicRes.data.departments,
          courses: academicRes.data.courses,
          batches: academicRes.data.batches
        });
      }

      // Fetch system settings
      try {
        const settingsRes = await api.get('/system-settings');
        if (settingsRes.data.success && settingsRes.data.settings) {
          setSysSettings(settingsRes.data.settings);
        }
      } catch (sErr) {
        console.error('Error fetching settings:', sErr);
      }

      // Fetch jobs
      try {
        const jobsRes = await api.get('/jobs');
        if (jobsRes.data.success) {
          setJobs(jobsRes.data.jobs || []);
        }
      } catch (jobsErr) {
        console.error('Error fetching jobs:', jobsErr);
      }

      // Fetch drives
      try {
        const drivesRes = await api.get('/drives');
        if (drivesRes.data.success) {
          setDrives(drivesRes.data.drives || []);
        }
      } catch (drivesErr) {
        console.error('Error fetching drives:', drivesErr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (user, nextStatus) => {
    if (!window.confirm(`Are you sure you want to set status of ${user.email} to ${nextStatus ? 'Active' : 'Suspended'}?`)) return;

    try {
      const { data } = await api.put(`/auth/users/${user._id}/status`, { isVerified: nextStatus });
      if (data.success) {
        fetchAdminData();
        alert(`User status updated successfully.`);
      }
    } catch (err) {
      alert('Failed to modify user status.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`WARNING: Deleting user ${user.email} will permanently remove their profile database record. Proceed?`)) return;

    try {
      const { data } = await api.delete(`/auth/users/${user._id}`);
      if (data.success) {
        fetchAdminData();
        alert('User account deleted.');
      }
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const handleCreateAcademicRecord = async (e) => {
    e.preventDefault();

    const payload = {
      type: academicType,
      name: nameVal || (academicType === 'batch' ? `${startYearVal}-${endYearVal}` : ''),
      code: codeVal,
      durationYears: parseInt(durationVal) || 4,
      startYear: parseInt(startYearVal) || 2026,
      endYear: parseInt(endYearVal) || 2030
    };

    try {
      const { data } = await api.post('/academic-settings', payload);
      if (data.success) {
        setNameVal('');
        setCodeVal('');
        setStartYearVal('');
        setEndYearVal('');
        fetchAdminData();
        alert('Academic configuration parameter registered.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register academic record');
    }
  };

  const handleDeleteAcademicRecord = async (type, id) => {
    if (!window.confirm(`Are you sure you want to remove this academic setting record?`)) return;

    try {
      const { data } = await api.delete(`/academic-settings/${type}/${id}`);
      if (data.success) {
        fetchAdminData();
        alert('Academic record removed.');
      }
    } catch (err) {
      alert('Failed to remove academic setting.');
    }
  };

  const handleSaveSystemSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const { data } = await api.put('/system-settings', sysSettings);
      if (data.success) {
        alert('Global System Settings updated and applied across all modules!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update system settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePurgeCache = async () => {
    setMaintActionLoading('cache');
    try {
      const { data } = await api.post('/system-settings/clear-cache');
      if (data.success) {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to purge system cache');
    } finally {
      setMaintActionLoading(null);
    }
  };

  const handleTriggerBackup = async () => {
    setMaintActionLoading('backup');
    try {
      const { data } = await api.post('/system-settings/backup');
      if (data.success) {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to execute database backup');
    } finally {
      setMaintActionLoading(null);
    }
  };


  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display whitespace-nowrap">System Administration</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Configure credentials, system metrics, and audit settings</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {getUserTabTitle()} ({getFilteredUsers().length})
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'academic' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Academic Settings
          </button>
          <button
            onClick={() => setActiveTab('jobs-drives')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'jobs-drives' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Jobs & Drives
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('audit-logs')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit-logs' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="System Logins" value={stats?.totalUsers || 0} icon={<Users size={22} />} variant="blue" />
            <StatCard title="Registered Students" value={stats?.studentsCount || 0} icon={<GraduationCap size={22} />} variant="violet" />
            <StatCard title="Corporate Recruiters" value={stats?.companiesCount || 0} icon={<ShieldCheck size={22} />} variant="emerald" />
            <StatCard title="Placement Managers" value={stats?.managersCount || 0} icon={<Briefcase size={22} />} variant="indigo" />
          </div>

          {/* Audit Logs Table */}
          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <Terminal size={18} className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800 font-display">Chronological Audit Registry</h3>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <div className="w-full">
                <table className="w-full text-xs text-left align-middle">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-3.5 whitespace-nowrap">Timestamp</th>
                      <th className="px-6 py-3.5 whitespace-nowrap">Operator</th>
                      <th className="px-6 py-3.5 whitespace-nowrap">Role</th>
                      <th className="px-6 py-3.5 whitespace-nowrap">Action</th>
                      <th className="px-6 py-3.5 whitespace-nowrap">Entity / ID</th>
                      <th className="px-6 py-3.5 text-right whitespace-nowrap">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-6 text-center text-slate-400">
                          <EmptyState title="No logs captured" message="Audit logs will register automatically." />
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3.5 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-6 py-3.5 font-semibold text-slate-800">{log.userEmail}</td>
                          <td className="px-6 py-3.5">
                            <Badge status={log.role === 'ADMIN' ? 'danger' : log.role === 'PLACEMENT_MANAGER' ? 'warning' : 'primary'}>
                              {log.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-700">{log.action}</td>
                          <td className="px-6 py-3.5 text-slate-500">{log.entity || 'N/A'} ({log.entityId?.slice(-6) || 'N/A'})</td>
                          <td className="px-6 py-3.5 text-right text-slate-400">{log.ipAddress || '::1'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display">{getUserTabTitle()} Manager</h3>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <div className="w-full">
              <table className="w-full text-xs text-left align-middle">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="px-6 py-3.5 whitespace-nowrap">Email</th>
                    <th className="px-6 py-3.5 whitespace-nowrap">Role</th>
                    <th className="px-6 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-6 py-3.5 whitespace-nowrap">Created Date</th>
                    <th className="px-6 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {getFilteredUsers().map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{usr.email}</td>
                      <td className="px-6 py-3.5">
                        <Badge status={usr.role === 'ADMIN' ? 'danger' : usr.role === 'PLACEMENT_MANAGER' ? 'warning' : 'primary'}>
                          {usr.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge status={usr.isVerified ? 'success' : 'danger'}>
                          {usr.isVerified ? 'ACTIVE' : 'SUSPENDED'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">{new Date(usr.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3.5 text-right flex items-center justify-end gap-2.5">
                        {usr.role !== 'ADMIN' && (
                          <>
                            {usr.isVerified ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-rose-500 border-rose-200 hover:bg-rose-50 p-1.5"
                                onClick={() => handleToggleUserStatus(usr, false)}
                                title="Suspend Account"
                              >
                                <UserX size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 border-none p-1.5 shadow-none"
                                onClick={() => handleToggleUserStatus(usr, true)}
                                title="Activate Account"
                              >
                                <UserCheck size={14} />
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-slate-400 hover:text-rose-600 border-slate-200 p-1.5"
                              onClick={() => handleDeleteUser(usr)}
                              title="Delete Account"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-page-enter">
          {/* Creator form panel */}
          <div className="lg:col-span-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-xs text-xs">
            <h3 className="text-sm font-bold text-slate-800 font-display mb-4">Add Academic Setting</h3>
            <form onSubmit={handleCreateAcademicRecord} className="flex flex-col gap-4">
              <Select
                label="Setting Type"
                options={[
                  { value: 'department', label: 'Department' },
                  { value: 'course', label: 'Degree / Course' },
                  { value: 'batch', label: 'Graduation Year Batch' }
                ]}
                value={academicType}
                onChange={(e) => setAcademicType(e.target.value)}
              />
              
              {academicType !== 'batch' ? (
                <>
                  <Input label="Name" placeholder="e.g. Master of Computer Applications" value={nameVal} onChange={(e) => setNameVal(e.target.value)} required />
                  <Input label="Code" placeholder="e.g. MCA" value={codeVal} onChange={(e) => setCodeVal(e.target.value)} required />
                  {academicType === 'course' && (
                    <Input label="Course Duration (Years)" type="number" value={durationVal} onChange={(e) => setDurationVal(e.target.value)} required />
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Year" type="number" placeholder="2022" value={startYearVal} onChange={(e) => setStartYearVal(e.target.value)} required />
                  <Input label="End Year" type="number" placeholder="2026" value={endYearVal} onChange={(e) => setEndYearVal(e.target.value)} required />
                </div>
              )}

              <Button type="submit" variant="primary" className="mt-2 py-2.5 shadow-none">
                Configure Setting
              </Button>
            </form>
          </div>

          {/* List panel */}
          <div className="lg:col-span-8 p-6 bg-white border border-slate-100 rounded-2xl shadow-xs text-xs flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-800 font-display">Academic Configurations</h3>
            
            {/* Departments */}
            <div>
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-2 font-display">Departments</p>
              <div className="flex flex-wrap gap-2">
                {academicData.departments.map((d) => (
                  <div key={d._id} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-100 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-700 uppercase">{d.code}</span>
                    <span className="text-[10px] text-slate-400">{d.name}</span>
                    <button onClick={() => handleDeleteAcademicRecord('department', d._id)} className="text-slate-400 hover:text-rose-500 font-bold text-xs pl-1">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div>
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-2 font-display">Degrees / Courses</p>
              <div className="flex flex-wrap gap-2">
                {academicData.courses.map((c) => (
                  <div key={c._id} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-100 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-700 uppercase">{c.code}</span>
                    <span className="text-[10px] text-slate-400">{c.name} ({c.durationYears} Years)</span>
                    <button onClick={() => handleDeleteAcademicRecord('course', c._id)} className="text-slate-400 hover:text-rose-500 font-bold text-xs pl-1">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Batches */}
            <div>
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-2 font-display">Graduation Batches</p>
              <div className="flex flex-wrap gap-2">
                {academicData.batches.map((b) => (
                  <div key={b._id} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-100 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-700 uppercase">{b.name}</span>
                    <span className="text-[10px] text-slate-400">({b.startYear} - {b.endYear})</span>
                    <button onClick={() => handleDeleteAcademicRecord('batch', b._id)} className="text-slate-400 hover:text-rose-500 font-bold text-xs pl-1">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'jobs-drives' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6 text-xs text-left">
          {location.pathname === '/admin/jobs' ? (
            <>
              <h3 className="text-sm font-bold text-slate-800 font-display">System Job Listings</h3>
              <div className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl leading-relaxed text-slate-600">
                Showcases all active corporate job postings registered in MongoDB.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {jobs.length === 0 ? (
                  <div className="col-span-3">
                    <EmptyState title="No Jobs Found" message="There are no jobs registered in the system." />
                  </div>
                ) : (
                  jobs.map((j) => (
                    <div key={j._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-2">
                      <span className="font-bold text-slate-800 leading-tight">{j.title}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{j.company?.name || 'Recruiter'} • {j.jobType}</span>
                      <span className="text-xs text-blue-600 font-extrabold mt-1">{j.ctc} LPA</span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold text-slate-800 font-display">Placement Drives</h3>
              <div className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl leading-relaxed text-slate-600">
                Showcases all scheduled placement drives and their approval states.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {drives.length === 0 ? (
                  <div className="col-span-3">
                    <EmptyState title="No Drives Found" message="There are no drives scheduled in the system." />
                  </div>
                ) : (
                  drives.map((d) => (
                    <div key={d._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-2">
                      <span className="font-bold text-slate-800 leading-tight">{d.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{d.company?.name || 'Recruiter'} • {d.mode}</span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-1">Date: {new Date(d.driveDate).toLocaleDateString()}</span>
                      <Badge className="w-fit mt-1" status={d.status === 'Completed' ? 'success' : d.status === 'Registration Open' ? 'primary' : 'warning'}>
                        {d.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6 text-xs text-left">
          <h3 className="text-sm font-bold text-slate-800 font-display">System Placement Analytics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 border border-slate-50 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average CTC Package</span>
              <span className="text-xl font-black text-slate-800 font-display block mt-1">9.2 LPA</span>
            </div>
            <div className="p-4 border border-slate-50 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Highest CTC Offer</span>
              <span className="text-xl font-black text-slate-800 font-display block mt-1">45.0 LPA</span>
            </div>
            <div className="p-4 border border-slate-50 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Student Placement Rate</span>
              <span className="text-xl font-black text-slate-800 font-display block mt-1">84.2%</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit-logs' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6 text-xs text-left">
          <h3 className="text-sm font-bold text-slate-800 font-display">Chronological Audit Registry</h3>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-left align-middle">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                <tr>
                  <th className="px-6 py-3.5 whitespace-nowrap">Action</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Operator</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Entity</th>
                  <th className="px-6 py-3.5 text-right whitespace-nowrap">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">No system events logged in database yet.</td>
                  </tr>
                ) : (
                  logs.map((lg) => (
                    <tr key={lg._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-800">{lg.action}</td>
                      <td className="px-6 py-3.5 text-slate-500">{lg.user?.email || 'System Account'}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-700">{lg.entityType} ({lg.entityId?.slice(-6)})</td>
                      <td className="px-6 py-3.5 text-right text-slate-400">{new Date(lg.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSystemSettings} className="flex flex-col gap-6 text-xs text-left animate-page-enter">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
                <Sliders size={20} className="text-amber-500" />
                Administrative Global Control Panel
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Manage institutional parameters, security policies, placement criteria defaults, and database maintenance.</p>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={savingSettings}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 py-2.5 px-5 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save size={16} />
              {savingSettings ? 'Saving Changes...' : 'Save System Settings'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Institution & Portal Identity */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe size={18} className="text-blue-500" />
                <h4 className="font-bold text-slate-800 font-display text-sm">Portal & Institution Identity</h4>
              </div>

              <Input
                label="Institution / Organization Title"
                value={sysSettings.institutionName || ''}
                onChange={(e) => setSysSettings({ ...sysSettings, institutionName: e.target.value })}
                placeholder="e.g. PlaceTrack Institutional Control Centre"
                required
              />

              <Input
                label="Primary System Admin Email"
                type="email"
                value={sysSettings.adminEmail || ''}
                onChange={(e) => setSysSettings({ ...sysSettings, adminEmail: e.target.value })}
                placeholder="e.g. admin@institution.edu"
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 font-display">System Broadcast Announcement</label>
                <textarea
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all text-slate-800"
                  rows="3"
                  value={sysSettings.systemAnnouncement || ''}
                  onChange={(e) => setSysSettings({ ...sysSettings, systemAnnouncement: e.target.value })}
                  placeholder="Banner notification message displayed to users across dashboards..."
                />
              </div>
            </div>

            {/* Card 2: Account Access & Onboarding Policy */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserCheck size={18} className="text-emerald-500" />
                <h4 className="font-bold text-slate-800 font-display text-sm">User Access & Registration Control</h4>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Student Self-Registration</span>
                  <span className="text-[11px] text-slate-400">Allow prospective students to create placement portal accounts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sysSettings.allowStudentRegistration || false}
                    onChange={(e) => setSysSettings({ ...sysSettings, allowStudentRegistration: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Recruiter Self-Registration</span>
                  <span className="text-[11px] text-slate-400">Allow corporate HRs to register company profiles</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sysSettings.allowRecruiterRegistration || false}
                    onChange={(e) => setSysSettings({ ...sysSettings, allowRecruiterRegistration: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Require Recruiter Account Verification</span>
                  <span className="text-[11px] text-slate-400">Placement Manager must approve recruiter before job creation</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sysSettings.requireRecruiterApproval || false}
                    onChange={(e) => setSysSettings({ ...sysSettings, requireRecruiterApproval: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Card 3: Security & Governance */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Lock size={18} className="text-violet-500" />
                <h4 className="font-bold text-slate-800 font-display text-sm">Security & Authentication Governance</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Session Timeout"
                  options={[
                    { value: 15, label: '15 Minutes' },
                    { value: 30, label: '30 Minutes' },
                    { value: 60, label: '1 Hour' },
                    { value: 720, label: '12 Hours' }
                  ]}
                  value={sysSettings.sessionTimeoutMinutes || 60}
                  onChange={(e) => setSysSettings({ ...sysSettings, sessionTimeoutMinutes: parseInt(e.target.value) })}
                />

                <Select
                  label="Max Failed Login Attempts"
                  options={[
                    { value: 3, label: '3 Attempts' },
                    { value: 5, label: '5 Attempts' },
                    { value: 10, label: '10 Attempts' }
                  ]}
                  value={sysSettings.maxLoginAttempts || 5}
                  onChange={(e) => setSysSettings({ ...sysSettings, maxLoginAttempts: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Strict Password Complexity</span>
                  <span className="text-[11px] text-slate-400">Require uppercase, numbers, and special characters</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sysSettings.strictPasswordPolicy || false}
                    onChange={(e) => setSysSettings({ ...sysSettings, strictPasswordPolicy: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Enforce 2FA Authentication</span>
                  <span className="text-[11px] text-slate-400">Mandate OTP verification for Placement Managers & Admins</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sysSettings.enable2FA || false}
                    onChange={(e) => setSysSettings({ ...sysSettings, enable2FA: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </div>

            {/* Card 4: Placement Policy Defaults */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Award size={18} className="text-amber-500" />
                <h4 className="font-bold text-slate-800 font-display text-sm">Placement Eligibility Criteria Defaults</h4>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Default Min CGPA"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={sysSettings.minCgpaDefault || 6.5}
                  onChange={(e) => setSysSettings({ ...sysSettings, minCgpaDefault: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Default Max Backlogs"
                  type="number"
                  min="0"
                  max="10"
                  value={sysSettings.maxBacklogsDefault ?? 0}
                  onChange={(e) => setSysSettings({ ...sysSettings, maxBacklogsDefault: parseInt(e.target.value) || 0 })}
                />
                <Input
                  label="Max Offers / Student"
                  type="number"
                  min="1"
                  max="10"
                  value={sysSettings.maxOffersPerStudent || 2}
                  onChange={(e) => setSysSettings({ ...sysSettings, maxOffersPerStudent: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Automated Email Dispatch</span>
                  <span className="text-[11px] text-slate-400">Send instant notification emails on new drive approvals</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sysSettings.emailNotificationsEnabled || false}
                    onChange={(e) => setSysSettings({ ...sysSettings, emailNotificationsEnabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Card 5: Maintenance & System Operations */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-teal-600" />
                <h4 className="font-bold text-slate-800 font-display text-sm">System Operations & Maintenance</h4>
              </div>
              <Badge status="success" className="gap-1 font-mono">
                <CheckCircle2 size={12} /> MongoDB Engine: ONLINE
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <Select
                label="Automated Database Backup Frequency"
                options={[
                  { value: 'Daily (02:00 AM)', label: 'Daily (02:00 AM)' },
                  { value: 'Weekly (Sunday)', label: 'Weekly (Sunday)' },
                  { value: 'Monthly', label: 'Monthly' },
                  { value: 'Disabled', label: 'Disabled' }
                ]}
                value={sysSettings.autoBackupSchedule || 'Daily (02:00 AM)'}
                onChange={(e) => setSysSettings({ ...sysSettings, autoBackupSchedule: e.target.value })}
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 font-display">System Cache & Indexes</label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePurgeCache}
                  disabled={maintActionLoading === 'cache'}
                  className="py-2.5 text-xs flex items-center justify-center gap-2 text-slate-700 cursor-pointer"
                >
                  <RefreshCw size={14} className={maintActionLoading === 'cache' ? 'animate-spin' : ''} />
                  {maintActionLoading === 'cache' ? 'Purging Cache...' : 'Purge Session Cache'}
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 font-display">Manual Database Snapshot</label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleTriggerBackup}
                  disabled={maintActionLoading === 'backup'}
                  className="py-2.5 text-xs flex items-center justify-center gap-2 text-teal-700 border-teal-200 bg-teal-50/50 hover:bg-teal-100 cursor-pointer"
                >
                  <Server size={14} />
                  {maintActionLoading === 'backup' ? 'Creating Snapshot...' : 'Run Backup Snapshot'}
                </Button>
              </div>
            </div>

            {/* Maintenance Mode Emergency Alert */}
            <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              sysSettings.maintenanceMode ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-3">
                <ShieldAlert size={22} className={sysSettings.maintenanceMode ? 'text-rose-600 animate-pulse' : 'text-slate-400'} />
                <div>
                  <span className="font-bold text-xs block">Emergency Portal Maintenance Mode</span>
                  <span className="text-[11px] opacity-80">Restricts student and recruiter logins while performing critical DB maintenance.</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={sysSettings.maintenanceMode || false}
                  onChange={(e) => setSysSettings({ ...sysSettings, maintenanceMode: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminDashboard;

//
