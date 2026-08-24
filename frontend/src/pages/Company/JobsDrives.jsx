import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { Button, Input, Select, Badge, LoadingSpinner, EmptyState } from '../../components/UI.jsx';
import { Briefcase, GraduationCap, Plus, Trash2, Calendar, DollarSign, MapPin, ListPlus } from 'lucide-react';

const CompanyJobsDrives = () => {
  const routeLocation = useLocation();
  const { profile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('drives'); // drives, jobs, create-job, create-drive

  useEffect(() => {
    const path = routeLocation.pathname;
    if (path === '/company/jobs') {
      setActiveTab('jobs');
    } else if (path === '/company/drives') {
      setActiveTab('drives');
    }
  }, [routeLocation]);

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [drives, setDrives] = useState([]);

  // Alert State
  const [alert, setAlert] = useState(null);

  // Job Form States
  const [jobTitle, setJobTitle] = useState('');
  const [jobCode, setJobCode] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [workMode, setWorkMode] = useState('Onsite');
  const [ctc, setCtc] = useState('');
  const [location, setLocation] = useState('');
  const [jobDesc, setJobDesc] = useState('');

  // Drive Form States
  const [driveName, setDriveName] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [regStart, setRegStart] = useState('');
  const [regEnd, setRegEnd] = useState('');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [allowedDepts, setAllowedDepts] = useState('CSE, IT, ECE');
  const [driveDescription, setDriveDescription] = useState('');

  // Dynamic Rounds State
  const [rounds, setRounds] = useState([
    { roundNumber: 1, roundName: 'Aptitude Test', roundType: 'Aptitude Test', duration: 60, mode: 'Online', maxScore: 100, passingScore: 45 }
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsRes = await api.get('/jobs');
      if (jobsRes.data.success) setJobs(jobsRes.data.jobs);

      const drivesRes = await api.get('/drives');
      if (drivesRes.data.success) setDrives(drivesRes.data.drives);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setAlert(null);

    const payload = {
      title: jobTitle,
      code: jobCode,
      jobType,
      workMode,
      ctc: parseFloat(ctc) || 0,
      location,
      description: jobDesc
    };

    try {
      const { data } = await api.post('/jobs', payload);
      if (data.success) {
        setAlert({ type: 'success', msg: 'Job posting registered successfully.' });
        // Clear fields
        setJobTitle(''); setJobCode(''); setCtc(''); setLocation(''); setJobDesc('');
        fetchData();
        setActiveTab('jobs');
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to register job posting.' });
    }
  };

  const handleAddRound = () => {
    const nextNum = rounds.length + 1;
    setRounds([...rounds, {
      roundNumber: nextNum,
      roundName: `Technical Interview ${nextNum - 1}`,
      roundType: 'Technical Interview',
      duration: 45,
      mode: 'Online',
      maxScore: 100,
      passingScore: 60
    }]);
  };

  const handleRemoveRound = (idx) => {
    const newRounds = rounds.filter((_, i) => i !== idx).map((r, i) => ({ ...r, roundNumber: i + 1 }));
    setRounds(newRounds);
  };

  const handleRoundChange = (idx, field, val) => {
    const newRounds = rounds.map((r, i) => (i === idx ? { ...r, [field]: val } : r));
    setRounds(newRounds);
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!selectedJobId) {
      setAlert({ type: 'danger', msg: 'Please select an associated Job Posting for this drive.' });
      return;
    }

    const deptArray = allowedDepts.split(',').map(d => d.trim()).filter(Boolean);

    const payload = {
      name: driveName,
      job: selectedJobId,
      driveDate,
      registrationStart: regStart,
      registrationEnd: regEnd,
      description: driveDescription,
      location,
      mode: workMode,
      eligibilityCriteria: {
        minCgpa: parseFloat(minCgpa) || 0,
        maxBacklogs: parseInt(maxBacklogs) || 0,
        allowedDepartments: deptArray
      }
    };

    try {
      const { data } = await api.post('/drives', payload);
      if (data.success) {
        const driveId = data.drive._id;

        // Submit Dynamic Rounds sequentially
        for (const round of rounds) {
          await api.post(`/drives/${driveId}/rounds`, round);
        }

        setAlert({ type: 'success', msg: 'Placement drive and recruitment rounds scheduled successfully.' });
        // Clear fields
        setDriveName(''); setDriveDate(''); setRegStart(''); setRegEnd(''); setDriveDescription('');
        setRounds([{ roundNumber: 1, roundName: 'Aptitude Test', roundType: 'Aptitude Test', duration: 60, mode: 'Online', maxScore: 100, passingScore: 45 }]);
        fetchData();
        setActiveTab('drives');
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to create drive.' });
    }
  };



  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">Manage Recruitment</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Configure job offerings and recruitment round timelines</p>
        </div>
        
        {/* Navigation Tab switchers */}
        <div className="flex gap-2">
          <Button variant={activeTab === 'drives' ? 'primary' : 'secondary'} size="sm" onClick={() => { setActiveTab('drives'); setAlert(null); }}>
            Placement Drives
          </Button>
          <Button variant={activeTab === 'jobs' ? 'primary' : 'secondary'} size="sm" onClick={() => { setActiveTab('jobs'); setAlert(null); }}>
            Job Postings
          </Button>
          <Button variant={activeTab === 'create-job' ? 'primary' : 'secondary'} size="sm" onClick={() => { setActiveTab('create-job'); setAlert(null); }} className="gap-1">
            <Plus size={14} /> New Job
          </Button>
          <Button variant={activeTab === 'create-drive' ? 'primary' : 'secondary'} size="sm" onClick={() => { setActiveTab('create-drive'); setAlert(null); }} className="gap-1">
            <Plus size={14} /> Schedule Drive
          </Button>
        </div>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'
        }`}>
          {alert.msg}
        </div>
      )}

      {/* Drives List */}
      {activeTab === 'drives' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.length === 0 ? (
            <div className="md:col-span-3"><EmptyState title="No active drives scheduled" message="Click 'Schedule Drive' to build a recruitment workflow." /></div>
          ) : (
            drives.map((d) => (
              <div key={d._id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-bold text-slate-800 font-display leading-tight">{d.name}</h3>
                  <Badge status={d.status === 'Approved' || d.status === 'Registration Open' ? 'success' : 'warning'}>
                    {d.status}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 text-xs text-slate-500 border-t border-slate-50 pt-4 mt-4 font-semibold">
                  <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" /> {d.job?.title}</span>
                  <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-slate-400" /> {d.job?.ctc} LPA</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> Drive: {new Date(d.driveDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Jobs List */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="md:col-span-3"><EmptyState title="No jobs posted yet" message="Click 'New Job' to create a corporate opening." /></div>
          ) : (
            jobs.map((j) => (
              <div key={j._id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-bold text-slate-800 font-display">{j.title}</h3>
                    <Badge status="primary">{j.jobType}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">{j.code}</p>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-6">{j.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-50 pt-4 font-semibold">
                  <span className="flex items-center gap-1"><DollarSign size={14} className="text-slate-400" /> {j.ctc} LPA</span>
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {j.location}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Job Form */}
      {activeTab === 'create-job' && (
        <div className="p-8 bg-white border border-slate-100 rounded-2xl max-w-3xl">
          <form onSubmit={handleCreateJob} className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Configure Job Opening</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Job Title" placeholder="e.g. Software Development Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
              <Input label="Job Code (Unique)" placeholder="e.g. MS-SDE-2026" value={jobCode} onChange={(e) => setJobCode(e.target.value)} required />
              <Select
                label="Job Type"
                options={[
                  { value: 'Full Time', label: 'Full Time' },
                  { value: 'Internship', label: 'Internship' },
                  { value: 'Internship + Full Time', label: 'Internship + Full Time' }
                ]}
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              />
              <Select
                label="Work Mode"
                options={[
                  { value: 'Onsite', label: 'Onsite' },
                  { value: 'Remote', label: 'Remote' },
                  { value: 'Hybrid', label: 'Hybrid' }
                ]}
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
              />
              <Input label="Salary Package (CTC in LPA)" type="number" step="0.1" placeholder="e.g. 12.5" value={ctc} onChange={(e) => setCtc(e.target.value)} required />
              <Input label="Primary Job Location" placeholder="e.g. Hyderabad, India" value={location} onChange={(e) => setLocation(e.target.value)} required />
              <div className="sm:col-span-2">
                <Input label="Detailed Job Description" placeholder="Explain roles, tasks, and tech stack details." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} required />
              </div>
            </div>
            <Button variant="primary" type="submit" className="w-fit self-end mt-4 px-6">
              Create Job Posting
            </Button>
          </form>
        </div>
      )}

      {/* Create Drive Form */}
      {activeTab === 'create-drive' && (
        <div className="p-8 bg-white border border-slate-100 rounded-2xl max-w-4xl">
          <form onSubmit={handleCreateDrive} className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Schedule Placement Drive</h3>
            
            {/* Associated Job Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Select Job Posting"
                options={[
                  { value: '', label: '-- Select Job --' },
                  ...jobs.map(j => ({ value: j._id, label: `${j.title} (${j.code} - ${j.ctc} LPA)` }))
                ]}
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                required
              />
              <Input label="Recruitment Drive Name" placeholder="e.g. Microsoft Elite hiring 2026" value={driveName} onChange={(e) => setDriveName(e.target.value)} required />
              <Input label="Registration Start Date" type="date" value={regStart} onChange={(e) => setRegStart(e.target.value)} required />
              <Input label="Registration Close Date" type="date" value={regEnd} onChange={(e) => setRegEnd(e.target.value)} required />
              <Input label="Assessment Drive Date" type="date" value={driveDate} onChange={(e) => setDriveDate(e.target.value)} required />
              <div className="hidden sm:block"></div>
            </div>

            <hr className="border-slate-50 my-2" />

            {/* Academic Eligibility Controls */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display mb-4">Academic Eligibility Rules</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Minimum Cumulative CGPA" type="number" step="0.1" value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} required />
                <Input label="Maximum Allowed Backlogs" type="number" value={maxBacklogs} onChange={(e) => setMaxBacklogs(e.target.value)} required />
                <Input label="Allowed Departments (Comma list)" placeholder="CSE, IT, ECE" value={allowedDepts} onChange={(e) => setAllowedDepts(e.target.value)} required />
              </div>
            </div>

            <hr className="border-slate-50 my-2" />

            {/* Dynamic Rounds section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Recruitment Rounds Workflow</p>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddRound} className="gap-1">
                  <ListPlus size={14} /> Add Selection Stage
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {rounds.map((round, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col sm:flex-row items-center gap-4 relative">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {round.roundNumber}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs w-full">
                      <Input
                        label="Round Title"
                        value={round.roundName}
                        onChange={(e) => handleRoundChange(idx, 'roundName', e.target.value)}
                        required
                      />
                      <Select
                        label="Type"
                        options={[
                          { value: 'Aptitude Test', label: 'Aptitude Test' },
                          { value: 'Coding Test', label: 'Coding Test' },
                          { value: 'Technical Interview', label: 'Technical Interview' },
                          { value: 'HR Interview', label: 'HR Interview' }
                        ]}
                        value={round.roundType}
                        onChange={(e) => handleRoundChange(idx, 'roundType', e.target.value)}
                      />
                      <Input
                        label="Duration (mins)"
                        type="number"
                        value={round.duration}
                        onChange={(e) => handleRoundChange(idx, 'duration', parseInt(e.target.value))}
                        required
                      />
                      <Input
                        label="Passing score"
                        type="number"
                        value={round.passingScore}
                        onChange={(e) => handleRoundChange(idx, 'passingScore', parseInt(e.target.value))}
                        required
                      />
                    </div>

                    {rounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <Input label="Additional Candidate Instructions" placeholder="Dress code, files to carry, virtual reporting schedules." value={driveDescription} onChange={(e) => setDriveDescription(e.target.value)} />
            </div>

            <Button variant="primary" type="submit" className="w-fit self-end mt-4 px-6">
              Publish Placement Drive
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompanyJobsDrives;
