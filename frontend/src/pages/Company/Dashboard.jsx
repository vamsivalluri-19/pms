import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import { LoadingSpinner, EmptyState } from '../../components/UI.jsx';
import {
  Briefcase,
  GraduationCap,
  Users,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CompanyDashboard = () => {
  const { profile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentDrives, setRecentDrives] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/stats/company');
        if (data.success) {
          setStats(data.stats);
          setRecentDrives(data.recentDrives);
          setRecentApplicants(data.recentApplicants);
        }
      } catch (error) {
        console.error('Error fetching company stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);



  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[60%] rounded-full bg-blue-500/20 blur-[60px]"></div>
        <div>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Recruiter Workspace</span>
          <h2 className="text-xl font-bold tracking-tight font-display mt-1">Hello, {profile?.recruiterName || 'Recruiter'}</h2>
          <p className="text-xs text-slate-400 mt-1">Configure job posts, schedule interview slots, and screen student applications for {profile?.name || 'Company'}.</p>
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Jobs" value={stats?.totalJobs || 0} icon={<Briefcase size={22} />} variant="blue" />
        <StatCard title="Recruitment Drives" value={stats?.totalDrives || 0} icon={<GraduationCap size={22} />} variant="indigo" />
        <StatCard title="Total Candidates" value={stats?.totalApplicants || 0} icon={<Users size={22} />} variant="violet" />
        <StatCard title="Selections Recorded" value={stats?.selectedStudents || 0} icon={<CheckCircle size={22} />} variant="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Drives list */}
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 font-display">Active Drives</h3>
            <Link to="/company/drives" className="text-xs font-bold text-primary-500 hover:text-primary-600 inline-flex items-center gap-1">
              Manage Drives <ArrowRight size={14} />
            </Link>
          </div>
          {recentDrives.length === 0 ? (
            <EmptyState title="No drives configured" message="Create your first recruitment drive under the Drives tab." />
          ) : (
            <div className="flex flex-col gap-4">
              {recentDrives.map((d) => (
                <div key={d._id} className="flex justify-between items-center p-4 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-all">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{d.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{d.job?.title} • {d.job?.ctc} LPA</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    d.status === 'Approved' || d.status === 'Registration Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applicants */}
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 font-display">Recent Applicants</h3>
            <Link to="/company/applications" className="text-xs font-bold text-primary-500 hover:text-primary-600 inline-flex items-center gap-1">
              Screen Candidates <ArrowRight size={14} />
            </Link>
          </div>
          {recentApplicants.length === 0 ? (
            <EmptyState title="No candidate applications" message="Applications will appear here once candidates start applying for registered drives." />
          ) : (
            <div className="flex flex-col gap-4">
              {recentApplicants.map((app) => (
                <div key={app._id} className="flex justify-between items-center p-4 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-all">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{app.student?.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{app.student?.department} • CGPA: {app.student?.cgpa} • Role: {app.job?.title}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
//
