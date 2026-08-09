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
  BookOpen
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
  
  // Academic Configurator State
  const [academicData, setAcademicData] = useState({ departments: [], courses: [], batches: [] });
  const [academicType, setAcademicType] = useState('department');
  const [nameVal, setNameVal] = useState('');
  const [codeVal, setCodeVal] = useState('');
  const [durationVal, setDurationVal] = useState('4');
  const [startYearVal, setStartYearVal] = useState('');
  const [endYearVal, setEndYearVal] = useState('');

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">System Administration</h2>
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
            User Logins ({usersList.length})
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

            <div className="overflow-hidden border border-slate-50 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Operator</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Action</th>
                      <th className="px-6 py-3.5">Entity / ID</th>
                      <th className="px-6 py-3.5 text-right">IP Address</th>
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
          <h3 className="text-sm font-bold text-slate-800 font-display">User Accounts Manager</h3>
          <div className="overflow-hidden border border-slate-50 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {usersList.map((usr) => (
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
          <h3 className="text-sm font-bold text-slate-800 font-display">System Jobs & Placement Drives</h3>
          <div className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl leading-relaxed text-slate-600">
            Showcases all corporate openings registered in MongoDB. Coordinator placement managers approve recruiter requests before publishing.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Software Engineer', comp: 'Microsoft', package: '12 LPA', type: 'Full Time' },
              { title: 'Data Scientist', comp: 'Google', package: '18 LPA', type: 'Full Time' },
              { title: 'QA Engineer', comp: 'Accenture', package: '8 LPA', type: 'Internship' }
            ].map((j, idx) => (
              <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-2">
                <span className="font-bold text-slate-800 leading-tight">{j.title}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{j.comp} • {j.type}</span>
                <span className="text-xs text-blue-600 font-extrabold mt-1">{j.package}</span>
              </div>
            ))}
          </div>
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
          <div className="overflow-hidden border border-slate-50 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Operator</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5 text-right">Date & Time</th>
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
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6 text-xs text-left">
          <h3 className="text-sm font-bold text-slate-800 font-display">Administrative Global Settings</h3>
          <div className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl text-slate-600 leading-relaxed">
            <p className="font-bold text-blue-800 mb-1">Global System Parameters</p>
            Configure authentication permissions, account verification checks, and automated database backups schedule.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-700">Allow Student Registrations</label>
              <input type="text" className="p-2.5 border border-slate-200 rounded-xl bg-slate-50" defaultValue="Yes (Open)" disabled />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-700">Recruiter Approval Policy</label>
              <input type="text" className="p-2.5 border border-slate-200 rounded-xl bg-slate-50" defaultValue="Manual Coordinator Review" disabled />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
//
