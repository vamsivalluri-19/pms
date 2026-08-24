import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api.js';
import { Button, LoadingSpinner, EmptyState, Badge } from '../../components/UI.jsx';
import {
  Users,
  Building,
  GraduationCap,
  Award,
  DollarSign,
  TrendingUp,
  CheckCircle,
  FileCheck,
  Briefcase,
  AlertCircle,
  Search,
  ChevronRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const ManagerDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Dashboard Telemetry
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // Approvals registries
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingDrives, setPendingDrives] = useState([]);
  
  // Mockup list components
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [recentPlacements, setRecentPlacements] = useState([]);
  const [interviews, setInterviews] = useState([]);

  // Mockup Trend Data matching high-fidelity mockup
  const successRateTrend = [
    { name: 'Sept', rate: 65 },
    { name: 'Oct', rate: 65 },
    { name: 'Nov', rate: 72 },
    { name: 'Feb', rate: 79 },
    { name: 'Mar', rate: 82 },
    { name: 'Apr', rate: 65 },
    { name: 'May', rate: 82 }
  ];

  const offerStatusData = [
    { name: 'Placed', value: 78, color: '#3b82f6' },
    { name: 'Pending', value: 15, color: '#a855f7' },
    { name: 'No Offer', value: 7, color: '#f97316' }
  ];

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/stats/manager');
      if (data.success) {
        setStats(data.stats);
        setChartData(data.departmentWiseData || []);
      }

      // Fetch pending companies
      const compRes = await api.get('/companies?status=PENDING');
      if (compRes.data.success) {
        setPendingCompanies(compRes.data.companies);
      }

      // Fetch pending drives
      const drivesRes = await api.get('/drives?status=Pending Approval');
      if (drivesRes.data.success) {
        setPendingDrives(drivesRes.data.drives);
      }

      // Fetch students list
      const studentsRes = await api.get('/students');
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.students);
        if (studentsRes.data.students.length > 0) {
          setSelectedStudent(studentsRes.data.students[0]);
        }
      }

      // Fetch placements
      const placementsRes = await api.get('/placements');
      if (placementsRes.data.success) {
        setRecentPlacements(placementsRes.data.placements);
      }

      // Fetch scheduled interviews
      try {
        const interviewsRes = await api.get('/interviews');
        if (interviewsRes.data.success) {
          setInterviews(interviewsRes.data.interviews || []);
        }
      } catch (iErr) {
        console.error('Error fetching interviews:', iErr);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/manager/companies') {
      setActiveTab('companies');
    } else if (path === '/manager/jobs' || path === '/manager/drives') {
      setActiveTab('drives');
    } else if (path === '/manager/interviews') {
      setActiveTab('interviews');
    } else if (path === '/manager/settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, [location]);

  const handleCompanyApproval = async (id, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision.toLowerCase()} this recruiter company profile?`)) return;

    try {
      const { data } = await api.put(`/companies/${id}/approve`, { status: decision });
      if (data.success) {
        fetchDashboardData();
        alert(`Recruiter has been ${decision.toLowerCase()} successfully.`);
      }
    } catch (err) {
      alert('Verification decision submission failed.');
    }
  };

  const handleDriveApproval = async (id, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision.toLowerCase()} this placement drive?`)) return;

    try {
      const { data } = await api.put(`/drives/${id}/approve`, { status: decision === 'APPROVE' ? 'Approved' : 'Rejected' });
      if (data.success) {
        fetchDashboardData();
        alert(`Placement drive registration has been ${decision === 'APPROVE' ? 'approved' : 'rejected'}.`);
      }
    } catch (err) {
      alert('Drive approval submission failed.');
    }
  };

  // Filter students progress list
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.department?.toLowerCase().includes(studentSearch.toLowerCase())
  );


  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display whitespace-nowrap">Dashboard Overview</h2>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Institution-level placements verification panel</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold gap-1 shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Trends
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'companies' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Recruiters ({pendingCompanies.length})
          </button>
          <button
            onClick={() => setActiveTab('drives')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'drives' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Drives Approval ({pendingDrives.length})
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'interviews' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Interviews
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          
          {/* Row of 4 metric tiles with mockup styles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Total Applicants */}
            <div className="p-6 bg-gradient-to-tr from-blue-500/10 via-violet-500/5 to-transparent border-l-4 border-blue-500 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-display">Total Applicants</span>
                <span className="text-2xl font-black text-slate-800 mt-2 block font-display">{stats?.totalStudents || 4250}</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+12% from last year</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-500 shrink-0">
                <Users size={20} />
              </div>
            </div>

            {/* Card 2: Job Offers */}
            <div className="p-6 bg-gradient-to-tr from-purple-500/10 via-violet-500/5 to-transparent border-l-4 border-purple-500 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-display">Job Offers</span>
                <span className="text-2xl font-black text-slate-800 mt-2 block font-display">{stats?.placedStudents || 1890}</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+8% from last year</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-purple-500 shrink-0">
                <Briefcase size={20} />
              </div>
            </div>

            {/* Card 3: Average Package */}
            <div className="p-6 bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent border-l-4 border-emerald-500 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-display">Average Package</span>
                <span className="text-2xl font-black text-slate-800 mt-2 block font-display">{stats?.averagePackage || 8.5} LPA</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+5% from last year</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500 shrink-0">
                <DollarSign size={20} />
              </div>
            </div>

            {/* Card 4: Companies */}
            <div className="p-6 bg-gradient-to-tr from-indigo-500/10 via-blue-500/5 to-transparent border-l-4 border-indigo-500 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-display">Companies</span>
                <span className="text-2xl font-black text-slate-800 mt-2 block font-display">{stats?.activeCompanies || 210}</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+15% from last year</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500 shrink-0">
                <Building size={20} />
              </div>
            </div>

          </div>

          {/* Row of 3 charts matching mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1: Placement Success Rate */}
            <div className="lg:col-span-5 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs text-xs">
              <h3 className="text-xs font-bold text-slate-700 font-display mb-4 uppercase tracking-wider">Placement Success Rate (AY 2023-24)</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={successRateTrend}>
                    <defs>
                      <linearGradient id="rateColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" unit="%" />
                    <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="rate" stroke="#4f46e5" fillOpacity={1} fill="url(#rateColor)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Job Offers by Department */}
            <div className="lg:col-span-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs text-xs">
              <h3 className="text-xs font-bold text-slate-700 font-display mb-4 uppercase tracking-wider">Job Offers by Department</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.length > 0 ? chartData : [
                    { name: 'CS', placed: 98 },
                    { name: 'IT', placed: 80 },
                    { name: 'Mech', placed: 65 },
                    { name: 'EEE', placed: 110 },
                    { name: 'MBA', placed: 40 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '12px' }} />
                    <Bar dataKey="placed" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Offers issued" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Offer Status Doughnut */}
            <div className="lg:col-span-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs text-xs flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-700 font-display mb-4 uppercase tracking-wider">Offer Status</h3>
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={offerStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {offerStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-800 font-display block">78%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Placed</span>
                </div>
              </div>
              
              {/* Legends list */}
              <div className="flex justify-around text-[10px] font-bold text-slate-500 border-t border-slate-50 pt-4 mt-2">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Placed</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500"></span> Pending</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500"></span> No Offer</span>
              </div>
            </div>

          </div>

          {/* Bottom row widgets: student progress and steppers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Widget 1: Student Placement Progress */}
            <div className="lg:col-span-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-700 font-display uppercase tracking-wider">Student Placement Progress</h3>
              
              {/* Search bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Filter by student, dept..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>

              {/* Cards List */}
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic py-4 text-center">No student logs found.</p>
                ) : (
                  filteredStudents.map((st) => (
                    <div
                      key={st._id}
                      onClick={() => setSelectedStudent(st)}
                      className={`p-3.5 border rounded-2xl transition-all cursor-pointer flex flex-col gap-2.5 text-xs text-left ${
                        selectedStudent?._id === st._id
                          ? 'border-blue-500 bg-blue-50/10 ring-2 ring-blue-500/5'
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-slate-100 font-bold text-slate-600 flex items-center justify-center font-display border border-slate-200/50 uppercase">
                            {st.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{st.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {st.studentId} • Dept: {st.department}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-slate-100/50 pt-2 text-[10px] font-bold">
                        <span className="text-slate-500">CGPA: {st.cgpa}</span>
                        <div className="flex gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Interviewing</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Offers Rec'd</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Widget 2: Applicant Timeline Stepper */}
            <div className="lg:col-span-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col gap-4 min-h-[350px]">
              <h3 className="text-xs font-bold text-slate-700 font-display uppercase tracking-wider">Applicant Timeline</h3>
              
              {selectedStudent ? (
                <div className="flex flex-col gap-5 text-xs">
                  <div className="flex items-center gap-2.5 border-b border-slate-50 pb-3">
                    <div className="h-8 w-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center font-display uppercase">
                      {selectedStudent.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{selectedStudent.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Applied ID: {selectedStudent.studentId}</p>
                    </div>
                  </div>

                  {/* Vertical Timeline stepper */}
                  <div className="flex flex-col gap-4.5 pl-2 mt-2">
                    {[
                      { title: 'Applied', date: 'Sep 15', done: true },
                      { title: 'Aptitude Test', date: 'Sep 20', done: true },
                      { title: 'Interview Round 1', date: 'Sep 28', done: true },
                      { title: 'Technical Interview', date: 'Oct 5', done: true },
                      { title: 'Offer Received', date: 'Oct 12', done: true },
                      { title: 'Joined Platform', date: 'Oct 15', done: true }
                    ].map((step, sIdx, arr) => (
                      <div key={sIdx} className="flex gap-4 items-start text-left">
                        <div className="flex flex-col items-center">
                          <div className="h-5 w-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0 shadow-sm border border-white">
                            ✓
                          </div>
                          {sIdx < arr.length - 1 && <div className="w-0.5 h-7 bg-blue-200"></div>}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-slate-800">{step.title}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{step.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-16 text-center">Select a candidate to view application timelines.</p>
              )}
            </div>

            {/* Widget 3: Top Recruiters & Recent Offers */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Recruiters list */}
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-700 font-display uppercase tracking-wider">Top Recruiters</h3>
                <div className="flex flex-col gap-2.5 text-xs">
                  {[
                    { name: 'Google', ctc: '32 LPA', color: 'bg-rose-50 text-rose-500' },
                    { name: 'Microsoft', ctc: '45 LPA', color: 'bg-blue-50 text-blue-500' },
                    { name: 'Accenture', ctc: '12 LPA', color: 'bg-purple-50 text-purple-500' },
                    { name: 'Catalate', ctc: '18 LPA', color: 'bg-emerald-50 text-emerald-500' }
                  ].map((rec, rIdx) => (
                    <div key={rIdx} className="flex items-center justify-between p-2 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg font-bold flex items-center justify-center uppercase shrink-0 font-display ${rec.color}`}>
                          {rec.name[0]}
                        </div>
                        <span className="font-bold text-slate-700">{rec.name}</span>
                      </div>
                      <span className="font-extrabold text-blue-600">{rec.ctc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Placements List */}
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-700 font-display uppercase tracking-wider">Recent Offers Log</h3>
                <div className="overflow-hidden border border-slate-50 rounded-xl text-[10px]">
                  <table className="w-full text-xs text-left align-middle">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                      <tr>
                        <th className="px-3 py-2 whitespace-nowrap">Student</th>
                        <th className="px-3 py-2 whitespace-nowrap">Company</th>
                        <th className="px-3 py-2 text-right whitespace-nowrap">Package</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentPlacements.length === 0 ? (
                        [
                          { name: 'Emily Chen', comp: 'Microsoft', pkg: '10 LPA' },
                          { name: 'Mark Lee', comp: 'Google', pkg: '12 LPA' },
                          { name: 'Priya Sharma', comp: 'Accenture', pkg: '8 LPA' }
                        ].map((m, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2.5 font-bold text-slate-800">{m.name}</td>
                            <td className="px-3 py-2.5 text-slate-500">{m.comp}</td>
                            <td className="px-3 py-2.5 text-right text-emerald-600 font-extrabold">{m.pkg}</td>
                          </tr>
                        ))
                      ) : (
                        recentPlacements.slice(0, 3).map((pl, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2.5 font-bold text-slate-800">{pl.student?.name}</td>
                            <td className="px-3 py-2.5 text-slate-500">{pl.company?.name}</td>
                            <td className="px-3 py-2.5 text-right text-emerald-600 font-extrabold">{pl.package} LPA</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {activeTab === 'companies' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Pending Recruiter Approvals</h3>
          {pendingCompanies.length === 0 ? (
            <EmptyState title="No pending registrations" message="All company registration profiles have been audited." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingCompanies.map((comp) => (
                <div key={comp._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50 flex flex-col justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{comp.name}</h4>
                    <div className="mt-2 text-slate-500 leading-relaxed">
                      <p><strong>Recruiter Coordinate:</strong> {comp.recruiterName} ({comp.recruiterEmail})</p>
                      <p className="mt-1"><strong>Industry:</strong> {comp.industry || 'Tech'} • Size: {comp.companySize || 'Medium'}</p>
                      <p className="mt-1"><strong>Headquarters:</strong> {comp.headquarters || 'N/A'}</p>
                      <p className="mt-2 italic">"{comp.description || 'No corporate description details provided.'}"</p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-slate-200/40 pt-4">
                    <Button
                      variant="primary"
                      className="flex-1 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 border-none shadow-none"
                      onClick={() => handleCompanyApproval(comp._id, 'APPROVED')}
                    >
                      Approve Recruiter
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 py-2 text-xs text-rose-500 border-rose-200 hover:bg-rose-50"
                      onClick={() => handleCompanyApproval(comp._id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'drives' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Pending Drive Registrations</h3>
          {pendingDrives.length === 0 ? (
            <EmptyState title="No pending drives" message="There are no company drives awaiting placement cell approval." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingDrives.map((d) => (
                <div key={d._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50 flex flex-col justify-between gap-4 text-xs">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 text-sm">{d.name}</h4>
                      <Badge status="warning">PENDING</Badge>
                    </div>
                    <div className="text-slate-500 leading-relaxed">
                      <p><strong>Recruiter Company:</strong> {d.company?.name || 'Recruiter'}</p>
                      <p className="mt-1"><strong>Applied Role:</strong> {d.job?.title || 'Engineer'}</p>
                      <p className="mt-1"><strong>Salary Package:</strong> {d.job?.ctc || 6.0} LPA • Mode: {d.mode}</p>
                      <p className="mt-2 font-bold text-slate-700">Eligibility Minimums:</p>
                      <p>CGPA &gt;= {d.eligibilityCriteria?.minCgpa || 6.0} • Backlogs &lt;= {d.eligibilityCriteria?.maxBacklogs || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-slate-200/40 pt-4">
                    <Button
                      variant="primary"
                      className="flex-1 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 border-none shadow-none"
                      onClick={() => handleDriveApproval(d._id, 'APPROVE')}
                    >
                      Approve Drive
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 py-2 text-xs text-rose-500 border-rose-200 hover:bg-rose-50"
                      onClick={() => handleDriveApproval(d._id, 'REJECT')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Campus Interviews Schedule</h3>
          <div className="overflow-hidden border border-slate-50 rounded-xl text-xs">
            <table className="w-full text-xs text-left align-middle">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                <tr>
                  <th className="px-6 py-3.5 whitespace-nowrap">Candidate</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Company</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Interviewer</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Mode / Link</th>
                  <th className="px-6 py-3.5 text-right whitespace-nowrap">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No interviews scheduled yet.
                    </td>
                  </tr>
                ) : (
                  interviews.map((inv, idx) => (
                    <tr key={inv._id || idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {inv.student?.name} {inv.student?.department && `(${inv.student.department})`}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{inv.company?.name || 'Recruiter'}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-700">{inv.interviewer || 'N/A'}</td>
                      <td className="px-6 py-3.5 text-blue-600 font-semibold">
                        {inv.meetingLink ? (
                          <a href={inv.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                            {inv.mode || 'Online'}
                          </a>
                        ) : (
                          inv.mode || 'Online'
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-700">
                        {inv.date ? new Date(inv.date).toLocaleDateString() : 'N/A'} at {inv.time || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Institutional System Config</h3>
          <div className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl text-xs leading-relaxed text-slate-600">
            <p className="font-bold text-blue-800 flex items-center gap-1.5 mb-2">
              <CheckCircle size={14} /> Placement Officer Configuration Console
            </p>
            Configure college policies, academic years, minimum CGPA checks, and verify document verification defaults.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-left">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-700">Placement Academic Year</label>
              <input type="text" className="p-2.5 border border-slate-200 rounded-xl bg-slate-50" defaultValue="AY 2026-2027" disabled />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-700">Minimum Permitted Cumulative CGPA</label>
              <input type="number" className="p-2.5 border border-slate-200 rounded-xl bg-slate-50" defaultValue="6.0" disabled />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-700">Document Verification Mode</label>
              <input type="text" className="p-2.5 border border-slate-200 rounded-xl bg-slate-50" defaultValue="Dual-Auth Officer Verification" disabled />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-700">Audit Logs Trail Mode</label>
              <input type="text" className="p-2.5 border border-slate-200 rounded-xl bg-slate-50" defaultValue="System-Wide Auditing Active" disabled />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
//
