import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api, { getUploadUrl } from '../../services/api.js';
import { Button, Input, Select, Badge, LoadingSpinner, EmptyState } from '../../components/UI.jsx';
import { Search, User, ClipboardList, Calendar, Award, ExternalLink, Filter, Video } from 'lucide-react';

const CompanyApplicants = () => {
  const location = useLocation();
  const [filterType, setFilterType] = useState('all'); // all, interviews, results

  useEffect(() => {
    const path = location.pathname;
    if (path === '/company/interviews') {
      setFilterType('interviews');
    } else if (path === '/company/results') {
      setFilterType('results');
    } else {
      setFilterType('all');
    }
  }, [location]);

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [minCgpa, setMinCgpa] = useState('0');
  const [deptFilter, setDeptFilter] = useState('');

  // Selected Checkboxes for Bulk Shortlist
  const [selectedApps, setSelectedApps] = useState(new Set());

  // Modal control States
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  
  // Scorecard entry fields
  const [scoreVal, setScoreVal] = useState('');
  const [maxScoreVal, setMaxScoreVal] = useState('100');
  const [roundResultVal, setRoundResultVal] = useState('Pass');
  const [scoreRemarks, setScoreRemarks] = useState('');
  const [roundsList, setRoundsList] = useState([]);
  const [selectedRoundId, setSelectedRoundId] = useState('');

  // Interview scheduler fields
  const [interviewer, setInterviewer] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  const fetchApplicants = async () => {
    try {
      const { data } = await api.get('/applications');
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error('Error fetching applicants database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleBulkShortlist = async () => {
    if (selectedApps.size === 0) return;
    setLoading(true);

    try {
      for (const appId of selectedApps) {
        await api.put(`/applications/${appId}/status`, { status: 'Shortlisted', remarks: 'Shortlisted for selection rounds' });
      }
      setSelectedApps(new Set());
      await fetchApplicants();
      alert('Selected applicants have been successfully Shortlisted.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxToggle = (appId) => {
    const nextSet = new Set(selectedApps);
    if (nextSet.has(appId)) {
      nextSet.delete(appId);
    } else {
      nextSet.add(appId);
    }
    setSelectedApps(nextSet);
  };

  // Launch Marks Entry popup
  const openScorecardModal = async (app) => {
    setActiveApp(app);
    setScoreVal('');
    setScoreRemarks('');
    try {
      const { data } = await api.get(`/drives/${app.drive?._id || app.drive}/rounds`);
      if (data.success) {
        setRoundsList(data.rounds);
        if (data.rounds.length > 0) {
          setSelectedRoundId(data.rounds[0]._id);
          setMaxScoreVal(String(data.rounds[0].maxScore || 100));
        }
      }
      setShowScoreModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const submitScorecard = async (e) => {
    e.preventDefault();
    if (!activeApp || !selectedRoundId) return;

    const payload = {
      studentId: activeApp.student?._id,
      driveId: activeApp.drive?._id,
      roundId: selectedRoundId,
      score: parseFloat(scoreVal) || 0,
      maxScore: parseFloat(maxScoreVal) || 100,
      result: roundResultVal,
      remarks: scoreRemarks
    };

    try {
      const { data } = await api.post('/results', payload);
      if (data.success) {
        setShowScoreModal(false);
        fetchApplicants();
        alert('Scorecard submitted. If passed, the application automatically promoted.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit score');
    }
  };

  // Launch Interview Scheduler
  const openInterviewModal = async (app) => {
    setActiveApp(app);
    setInterviewer('');
    setInterviewDate('');
    setInterviewTime('');
    setMeetingLink(`${window.location.origin}/interview/${app._id}`);
    setInterviewNotes('');
    try {
      const { data } = await api.get(`/drives/${app.drive?._id || app.drive}/rounds`);
      if (data.success) {
        setRoundsList(data.rounds);
        if (data.rounds.length > 0) setSelectedRoundId(data.rounds[0]._id);
      }
      setShowInterviewModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const submitInterview = async (e) => {
    e.preventDefault();
    if (!activeApp || !selectedRoundId) return;

    const payload = {
      studentId: activeApp.student?._id,
      driveId: activeApp.drive?._id,
      roundId: selectedRoundId,
      interviewer,
      date: interviewDate,
      time: interviewTime,
      mode: 'Online',
      meetingLink,
      notes: interviewNotes
    };

    try {
      const { data } = await api.post('/interviews', payload);
      if (data.success) {
        // Also promote application status to In Progress
        await api.put(`/applications/${activeApp._id}/status`, { status: 'In Progress', remarks: 'Interview Scheduled' });
        setShowInterviewModal(false);
        fetchApplicants();
        alert('Virtual interview session booked and candidate notified.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    }
  };

  // Handle final selection record placement
  const handleFinalSelect = async (app) => {
    if (!window.confirm(`Are you sure you want to select ${app.student?.name} for the position? This will issue a placement offer.`)) return;

    const payload = {
      studentId: app.student?._id,
      driveId: app.drive?._id,
      jobId: app.job?._id,
      companyId: app.company?._id,
      salaryPackage: app.job?.ctc || 8.0,
      location: app.job?.location || 'Bengaluru'
    };

    try {
      const { data } = await api.post('/placements', payload);
      if (data.success) {
        fetchApplicants();
        alert(`Congratulations! ${app.student?.name} has been selected.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record selection');
    }
  };

  // Filter application listings
  const filteredApplicants = applications.filter((app) => {
    const student = app.student || {};
    const matchesSearch = student.name?.toLowerCase().includes(search.toLowerCase()) || student.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchesCgpa = student.cgpa >= parseFloat(minCgpa);
    const matchesDept = deptFilter ? student.department === deptFilter : true;
    
    let matchesFilter = true;
    if (filterType === 'interviews') {
      matchesFilter = app.status === 'In Progress' || app.status === 'Shortlisted';
    } else if (filterType === 'results') {
      matchesFilter = app.status === 'Selected' || app.status === 'Rejected' || app.status === 'Shortlisted';
    }
    
    return matchesSearch && matchesCgpa && matchesDept && matchesFilter;
  });



  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">Screen Candidates</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Review candidate portfolios, scorecard marks, and schedule interview stages</p>
        </div>
        
        {/* Bulk Action Button */}
        {selectedApps.size > 0 && (
          <Button variant="primary" onClick={handleBulkShortlist} className="py-2.5 animate-bounce">
            Bulk Shortlist ({selectedApps.size})
          </Button>
        )}
      </div>

      {/* Filter panel */}
      <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search candidate name or ID..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-44 flex flex-col gap-1">
          <Select
            options={[
              { value: '', label: 'All Departments' },
              { value: 'CSE', label: 'Computer Science (CSE)' },
              { value: 'IT', label: 'Information Technology (IT)' },
              { value: 'ECE', label: 'Electronics (ECE)' }
            ]}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          />
        </div>
        <div className="w-full md:w-56 flex items-center gap-3">
          <span className="font-semibold text-slate-500 shrink-0">Min CGPA: {minCgpa}</span>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
          />
        </div>
      </div>

      {/* Master table grids */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-x-auto shadow-xs">
        <div className="w-full">
          <table className="w-full text-xs text-left align-middle">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 w-12 text-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedApps(new Set(filteredApplicants.filter(a => a.status === 'Applied').map(a => a._id)));
                      } else {
                        setSelectedApps(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Student ID / Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Department / CGPA</th>
                <th className="px-6 py-4 whitespace-nowrap">Applied Position</th>
                <th className="px-6 py-4 whitespace-nowrap">Stage Status</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <EmptyState title="No candidate applications found" message="Drives without registrations will show empty listings." />
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedApps.has(app._id)}
                        onChange={() => handleCheckboxToggle(app._id)}
                        disabled={app.status !== 'Applied'}
                        className="rounded border-slate-300 text-primary-500 disabled:opacity-30"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div>
                        <p>{app.student?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{app.student?.studentId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p>{app.student?.department}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">CGPA: {app.student?.cgpa}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-700">{app.job?.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{app.drive?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        status={
                          app.status === 'Selected' ? 'success' :
                          app.status === 'Rejected' ? 'danger' : 'primary'
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                      {app.student?.resume?.fileUrl && (
                        <a
                          href={getUploadUrl(app.student.resume.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 border border-slate-100 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                          title="View Resume"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      
                      {app.status !== 'Selected' && app.status !== 'Rejected' && (
                        <>
                          {app.status === 'In Progress' && (
                            <Link
                              to={`/interview/${app._id}`}
                              className="p-1.5 border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors flex items-center justify-center shrink-0"
                              title="Join Live Interview"
                            >
                              <Video size={14} />
                            </Link>
                          )}
                          <Button variant="secondary" size="sm" onClick={() => openScorecardModal(app)} title="Grade Scorecard">
                            <Award size={14} />
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => openInterviewModal(app)} title="Schedule Interview">
                            <Calendar size={14} />
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => handleFinalSelect(app)} className="bg-emerald-500 hover:bg-emerald-600 shadow-none">
                            Select
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marks Entry Grade Popup Modal */}
      {showScoreModal && activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-xs" onClick={() => setShowScoreModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full z-10 text-xs animate-page-enter">
            <h3 className="text-sm font-bold text-slate-800 font-display mb-4">Record Round Score</h3>
            <form onSubmit={submitScorecard} className="flex flex-col gap-4">
              <Select
                label="Select Drive Round"
                options={roundsList.map(r => ({ value: r._id, label: `Round ${r.roundNumber}: ${r.roundName}` }))}
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Score Awarded" type="number" value={scoreVal} onChange={(e) => setScoreVal(e.target.value)} required />
                <Input label="Max Score" type="number" value={maxScoreVal} disabled required />
              </div>
              <Select
                label="Round Outcome"
                options={[{ value: 'Pass', label: 'Pass (Move to next round)' }, { value: 'Fail', label: 'Fail' }, { value: 'Absent', label: 'Absent' }]}
                value={roundResultVal}
                onChange={(e) => setRoundResultVal(e.target.value)}
              />
              <Input label="Evaluator Feedback Remarks" value={scoreRemarks} onChange={(e) => setScoreRemarks(e.target.value)} />
              
              <div className="flex gap-3 justify-end mt-4 border-t border-slate-50 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowScoreModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Submit Grade</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Virtual Interview Booking Modal */}
      {showInterviewModal && activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-xs" onClick={() => setShowInterviewModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full z-10 text-xs animate-page-enter">
            <h3 className="text-sm font-bold text-slate-800 font-display mb-4">Book Video Interview</h3>
            <form onSubmit={submitInterview} className="flex flex-col gap-4">
              <Select
                label="Select Corresponding Round"
                options={roundsList.map(r => ({ value: r._id, label: `Round ${r.roundNumber}: ${r.roundName}` }))}
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                required
              />
              <Input label="Interviewer Name" placeholder="e.g. Satya Nadela" value={interviewer} onChange={(e) => setInterviewer(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Interview Date" type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} required />
                <Input label="Time Slot" type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} required />
              </div>
              <Input label="PlaceTrack Live Video Room Link (Auto-Generated)" value={meetingLink} disabled />
              <Input label="Candidate prep instructions notes" value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} />

              <div className="flex gap-3 justify-end mt-4 border-t border-slate-50 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowInterviewModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Schedule Interview</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyApplicants;
//
