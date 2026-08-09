import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { Button, LoadingSpinner, EmptyState, Badge } from '../../components/UI.jsx';
import {
  ClipboardList,
  Calendar,
  Clock,
  Video,
  Award,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const StudentApplications = () => {
  const location = useLocation();
  const { profile } = useContext(AuthContext);
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, interviews, results, placements
  
  // Placements list for offers acceptance
  const [placements, setPlacements] = useState([]);

  const fetchApplicationsData = async () => {
    try {
      const appsRes = await api.get('/applications');
      if (appsRes.data.success) {
        setApplications(appsRes.data.applications);
      }

      // Fetch placements offers
      const placementsRes = await api.get('/placements');
      if (placementsRes.data.success) {
        // Filter placements belonging to this student
        const studentPlacements = placementsRes.data.placements.filter(p => p.student?._id === profile?._id || p.student === profile?._id);
        setPlacements(studentPlacements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsData();
  }, [profile]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/student/interviews') {
      setFilterType('interviews');
    } else if (path === '/student/results') {
      setFilterType('results');
    } else if (path === '/student/placements') {
      setFilterType('placements');
    } else {
      setFilterType('all');
    }
  }, [location]);

  const handleOfferAction = async (placementId, action) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this job offer?`)) return;

    try {
      const { data } = await api.put(`/placements/${placementId}`, {
        offerStatus: action === 'ACCEPT' ? 'Offer Accepted' : 'Offer Rejected',
        placementStatus: action === 'ACCEPT' ? 'Joined' : 'Not Joined'
      });

      if (data.success) {
        if (action === 'ACCEPT') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        fetchApplicationsData();
        alert(`Offer has been ${action.toLowerCase()}ed.`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit offer response.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display capitalize">
            {filterType === 'all' ? 'My Applications' : filterType}
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {filterType === 'all' && 'Track your submitted selection stages'}
            {filterType === 'interviews' && 'Upcoming virtual reporting schedules'}
            {filterType === 'results' && 'Academic round grading records'}
            {filterType === 'placements' && 'Corporate placement selection letters'}
          </p>
        </div>

        {/* Tab Indicator Badges */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1 shrink-0">
          <Badge status={filterType === 'all' ? 'primary' : 'light'}>Applications ({applications.length})</Badge>
          <Badge status={filterType === 'placements' ? 'success' : 'light'}>Offers ({placements.length})</Badge>
        </div>
      </div>

      {filterType === 'all' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display">Submitted Applications</h3>
          {applications.length === 0 ? (
            <EmptyState title="No applications submitted" message="Browse active drives to apply for matching recruiter positions." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {applications.map((app) => (
                <div key={app._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500 text-white font-extrabold flex items-center justify-center text-sm font-display uppercase shrink-0">
                      {app.company?.name ? app.company.name[0] : 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{app.job?.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">
                        {app.company?.name} • Round: {app.currentRound}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-2">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge status={app.status === 'Selected' ? 'success' : app.status === 'Rejected' ? 'danger' : 'primary'}>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {filterType === 'interviews' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display">Virtual Interview Schedule</h3>
          
          {/* List interviews */}
          {applications.filter(a => a.status === 'In Progress' || a.status === 'Shortlisted').length === 0 ? (
            <EmptyState title="No upcoming interviews" message="Your scheduled interview sessions will appear here once booked by recruiters." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {applications.filter(a => a.status === 'In Progress' || a.status === 'Shortlisted').map((app) => (
                <div key={app._id} className="p-5 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-4 text-xs text-slate-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{app.job?.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{app.company?.name}</p>
                    </div>
                    <Badge status="warning">ROUND {app.currentRound}</Badge>
                  </div>
                  
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex flex-col gap-2">
                    <p className="font-bold text-slate-700 flex items-center gap-1.5"><Clock size={12} /> Mode: Video Assessment Interview</p>
                    <p className="text-[10px] text-slate-500">Contact coordinator or recruiter panel for any rescheduling query.</p>
                    
                    <a
                      href="https://zoom.us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 text-[10px]"
                    >
                      <Video size={12} /> Launch Video Interview
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {filterType === 'results' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display">Academic Round Results</h3>
          {applications.length === 0 ? (
            <EmptyState title="No results recorded" message="Rounds results scorecards will display here once evaluators grade sheets." />
          ) : (
            <div className="overflow-hidden border border-slate-50 rounded-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Job Role</th>
                    <th className="px-6 py-3.5">Latest Round</th>
                    <th className="px-6 py-3.5">Round Status</th>
                    <th className="px-6 py-3.5 text-right">Application Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-800">{app.company?.name}</td>
                      <td className="px-6 py-3.5 text-slate-500">{app.job?.title}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-700">Round {app.currentRound}</td>
                      <td className="px-6 py-3.5">
                        <Badge status={app.status === 'Selected' ? 'success' : app.status === 'Rejected' ? 'danger' : 'primary'}>
                          {app.status === 'Selected' ? 'Passed' : app.status === 'Rejected' ? 'Failed' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-700">{app.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {filterType === 'placements' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-800 font-display">Job Offer Selection Letters</h3>
          {placements.length === 0 ? (
            <EmptyState title="No offers received yet" message="Secure placements offers will show up here once you clear recruiter selection rounds." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {placements.map((pl) => (
                <div key={pl._id} className="p-6 border border-emerald-100 bg-emerald-50/10 rounded-2xl flex flex-col gap-4 text-xs text-slate-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{pl.company?.name || 'Recruiter'}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Location: {pl.location}</p>
                    </div>
                    <Badge status="success">OFFER GENERATED</Badge>
                  </div>
                  
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Salary Package Offer</span>
                    <p className="text-2xl font-black text-emerald-600 font-display mt-0.5">{pl.package} LPA</p>
                  </div>

                  {pl.offerStatus === 'Offer Received' ? (
                    <div className="flex gap-3 border-t border-slate-100/50 pt-4 mt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 border-none"
                        onClick={() => handleOfferAction(pl._id, 'ACCEPT')}
                      >
                        Accept Placement
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 py-2 text-rose-500 border-rose-200 hover:bg-rose-50"
                        onClick={() => handleOfferAction(pl._id, 'REJECT')}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 border-t border-slate-100/50 pt-4 mt-2 font-semibold">
                      <span>Status:</span>
                      <Badge status={pl.offerStatus.includes('Accepted') ? 'success' : 'danger'}>
                        {pl.offerStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
//
