import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { Button, LoadingSpinner, EmptyState, Badge } from '../../components/UI.jsx';
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const StudentDrives = () => {
  const { profile } = useContext(AuthContext);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Detail Overlay State
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [driveRounds, setDriveRounds] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [appliedDrives, setAppliedDrives] = useState(new Set());
  const [submittingApp, setSubmittingApp] = useState(false);

  const fetchDrives = async () => {
    try {
      const drivesRes = await api.get('/drives?status=Approved');
      if (drivesRes.data.success) {
        setDrives(drivesRes.data.drives);
      }
      
      // Fetch user's existing applications to map applied status
      const appsRes = await api.get('/applications');
      if (appsRes.data.success) {
        const set = new Set(appsRes.data.applications.map(a => a.drive?._id || a.drive));
        setAppliedDrives(set);
      }
    } catch (err) {
      console.error('Error fetching drives list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleSelectDrive = async (drive) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/drives/${drive._id}`);
      if (data.success) {
        setSelectedDrive(data.drive);
        setDriveRounds(data.rounds);
        setEligibility(data.eligibility);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedDrive || !eligibility?.eligible) return;
    setSubmittingApp(true);

    try {
      const { data } = await api.post('/applications', { driveId: selectedDrive._id });
      if (data.success) {
        setAppliedDrives((prev) => new Set([...prev, selectedDrive._id]));
        setSelectedDrive(null);
        fetchDrives();
        alert('Application submitted successfully! Track your rounds in the Applications tab.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Filter drives list
  const filteredDrives = drives.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.job?.title?.toLowerCase().includes(search.toLowerCase())
  );



  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">Campus Placement Drives</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Browse active recruiter openings</p>
        </div>
        {/* Search input */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search drives, companies, roles..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 shadow-xs bg-white text-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Master Drives list */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {filteredDrives.length === 0 ? (
            <EmptyState title="No active drives matching query" message="Try searching for another corporate recruiter or check back later." />
          ) : (
            filteredDrives.map((d) => (
              <div
                key={d._id}
                onClick={() => handleSelectDrive(d)}
                className={`p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col sm:flex-row items-start justify-between gap-6 cursor-pointer ${
                  selectedDrive?._id === d._id ? 'border-primary-500 ring-2 ring-primary-500/5' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500 text-white font-extrabold flex items-center justify-center text-base font-display uppercase">
                    {d.company?.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-display">{d.job?.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">{d.company?.name}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-slate-400" /> {d.job?.ctc} LPA</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {d.job?.location}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(d.driveDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-fit gap-3 self-stretch sm:self-center border-t border-slate-50 pt-4 sm:pt-0 sm:border-0">
                  <Badge status={
                    appliedDrives.has(d._id) ? 'primary' :
                    new Date(d.registrationEnd) < new Date() ? 'danger' : 'success'
                  }>
                    {appliedDrives.has(d._id) ? 'APPLIED' :
                     new Date(d.registrationEnd) < new Date() ? 'CLOSED' : 'ACTIVE'}
                  </Badge>
                  <ChevronRight size={18} className="text-slate-400 hidden sm:block" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detailed Side Drawer Overlay */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
          {detailLoading ? (
            <div className="py-20"><LoadingSpinner /></div>
          ) : selectedDrive ? (
            <div className="flex flex-col gap-6 animate-page-enter">
              {/* Header Branding */}
              <div className="flex items-start gap-3 border-b border-slate-50 pb-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm font-display uppercase shrink-0">
                  {selectedDrive.company?.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-display leading-tight">{selectedDrive.name}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase mt-1">{selectedDrive.company?.name} • {selectedDrive.job?.jobType}</p>
                </div>
              </div>

              {/* Description & CTC info */}
              <div className="text-xs text-slate-500 leading-relaxed flex flex-col gap-4">
                <div>
                  <p className="font-bold text-slate-700 mb-1 font-display">Job Description</p>
                  <p>{selectedDrive.job?.description || selectedDrive.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-50 py-3 font-semibold text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-display block">Salary Package</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedDrive.job?.ctc} LPA</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-display block">Work Mode</span>
                    <span>{selectedDrive.job?.workMode || selectedDrive.mode}</span>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-50/50 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-display block">Drive Date</span>
                      <span>{new Date(selectedDrive.driveDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-display block">Registration Deadline</span>
                      <span className={new Date(selectedDrive.registrationEnd) < new Date() ? 'text-rose-500 font-bold' : ''}>
                        {new Date(selectedDrive.registrationEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Eligibility Check panel */}
              <div className="p-4 rounded-xl border flex flex-col gap-3 text-xs bg-slate-50 border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 font-display">Eligibility Verdict</span>
                  <Badge status={
                    new Date(selectedDrive.registrationEnd) < new Date() ? 'danger' :
                    eligibility?.eligible ? 'success' : 'danger'
                  }>
                    {new Date(selectedDrive.registrationEnd) < new Date() ? 'CLOSED' :
                     eligibility?.eligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                  </Badge>
                </div>
                {new Date(selectedDrive.registrationEnd) < new Date() ? (
                  <p className="text-[11px] text-rose-500 font-semibold leading-snug">Registration has closed for this drive. New applications are no longer accepted.</p>
                ) : eligibility?.eligible ? (
                  <p className="text-[11px] text-emerald-600 font-medium">Your academic credentials meet the criteria. You can apply.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 mt-1.5 text-[11px] text-rose-500">
                    <p className="font-bold uppercase tracking-wider text-[9px] text-rose-600">Disqualification Reasons:</p>
                    <ul className="list-disc list-inside flex flex-col gap-1">
                      {eligibility?.reasons?.map((r, index) => (
                        <li key={index} className="leading-snug">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recruitment Rounds Timeline details */}
              <div>
                <p className="text-xs font-bold text-slate-700 font-display mb-3">Recruitment Rounds ({driveRounds.length})</p>
                <div className="flex flex-col gap-3">
                  {driveRounds.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Rounds list has not been configured yet.</p>
                  ) : (
                    driveRounds.map((round, rIdx) => (
                      <div key={round._id} className="flex gap-2.5 text-xs text-left">
                        <div className="flex flex-col items-center">
                          <div className="h-5 w-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center border border-slate-200 shrink-0">
                            {round.roundNumber}
                          </div>
                          {rIdx < driveRounds.length - 1 && <div className="w-0.5 h-full bg-slate-100"></div>}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="font-bold text-slate-800 leading-none">{round.roundName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">{round.roundType} • {round.duration} mins</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-50 pt-4 flex gap-3 mt-2">
                {appliedDrives.has(selectedDrive._id) ? (
                  <Button variant="secondary" className="w-full gap-2" disabled>
                    <CheckCircle size={14} /> Applied
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={new Date(selectedDrive.registrationEnd) < new Date() || !eligibility?.eligible || submittingApp}
                    onClick={handleApply}
                  >
                    {submittingApp ? 'Submitting...' : 
                     new Date(selectedDrive.registrationEnd) < new Date() ? 'Registration Closed' :
                     eligibility?.eligible ? 'Apply for Position' : 'Locked'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Briefcase size={32} className="text-slate-200 animate-pulse-slow" />
              <p className="text-xs text-slate-400 font-semibold">Select a drive from the listing to examine eligibility criteria and register.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDrives;
