import React, { useEffect, useState } from 'react';
import api, { getUploadUrl } from '../../services/api.js';
import { Button, Input, Select, Badge, LoadingSpinner, EmptyState } from '../../components/UI.jsx';
import { Search, Award, Printer, User, Filter, ArrowLeft, Download } from 'lucide-react';

const StudentHallTickets = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications');
      if (data.success) {
        // Only allow tickets for approved applications
        const approvedApps = data.applications.filter(
          (app) => app.status !== 'Rejected'
        );
        setApplications(approvedApps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrives = async () => {
    try {
      const { data } = await api.get('/drives');
      if (data.success) {
        // Show active or approved drives
        setDrives(data.drives || []);
        if (data.drives && data.drives.length > 0) {
          setSelectedDriveId(data.drives[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchDrives();
  }, []);

  const handleGenerateTicketsBulk = async () => {
    if (!selectedDriveId) return;
    setGenerating(true);
    try {
      const { data } = await api.post(`/applications/drives/${selectedDriveId}/generate-tickets`);
      if (data.success) {
        alert(data.message);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate drive hall tickets.');
    } finally {
      setGenerating(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const studentName = app.student?.name || '';
    const studentId = app.student?.studentId || '';
    const companyName = app.company?.name || '';
    const jobTitle = app.job?.title || '';
    
    const matchesSearch = 
      studentName.toLowerCase().includes(search.toLowerCase()) || 
      studentId.toLowerCase().includes(search.toLowerCase()) || 
      companyName.toLowerCase().includes(search.toLowerCase()) || 
      jobTitle.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter ? app.student?.department === deptFilter : true;
    return matchesSearch && matchesDept;
  });


  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 font-display">Student Placement Hall Tickets</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Browse, audit, and batch download/print candidate venue admission keys</p>
      </div>

      {/* Bulk Ticket Generator Panel */}
      <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
        <div className="absolute top-[-30%] right-[-30%] w-[50%] h-[50%] rounded-full bg-primary-500/5 blur-[40px] pointer-events-none"></div>
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-800 font-display">Bulk Generate Candidate Passes</h3>
          <p className="text-[10.5px] text-slate-400 font-semibold uppercase leading-snug">
            Select a drive to release admission keys and dispatch system alert notifications to all applied students at once.
          </p>
          <div className="mt-2 max-w-md w-full">
            <Select
              options={
                drives.length > 0 
                  ? drives.map(d => ({ value: d._id, label: `${d.company?.name || 'Company'} - ${d.name}` })) 
                  : [{ value: '', label: 'No placement drives active' }]
              }
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
            />
          </div>
        </div>
        <div className="shrink-0 sm:pb-1">
          <Button
            variant="primary"
            onClick={handleGenerateTicketsBulk}
            disabled={generating || !selectedDriveId}
            className="w-full sm:w-auto px-6 py-2.5 shadow-lg shadow-primary-500/10"
          >
            {generating ? 'Releasing Tickets...' : 'Generate All Tickets'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search candidate name, ID, or company..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
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
      </div>

      {/* Applications list */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-x-auto shadow-xs">
        <div className="w-full">
          <table className="w-full text-xs text-left align-middle">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Student ID / Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Department / CGPA</th>
                <th className="px-6 py-4 whitespace-nowrap">Applied Job / Drive</th>
                <th className="px-6 py-4 whitespace-nowrap">Application Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Ticket Status</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <EmptyState title="No candidate hall tickets found" message="Active student applications will appear here." />
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/40 transition-colors">
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
                        <p className="text-[10px] text-slate-400 mt-0.5">{app.company?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={app.status === 'Selected' ? 'success' : 'primary'}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      <Badge status={app.hallTicketGenerated ? 'success' : 'warning'}>
                        {app.hallTicketGenerated ? 'GENERATED' : 'PENDING'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedTicket(app)}
                        className="gap-1 text-[10px] font-bold text-primary-600 hover:text-white border-slate-200 hover:bg-primary-600"
                      >
                        <Printer size={12} /> Print Ticket
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hall Ticket Preview & Print Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-page-enter">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary-600 text-white">
                  <Award size={16} />
                </div>
                <span className="font-bold font-display text-sm text-slate-800">Candidate Admission Pass</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer font-display"
              >
                ×
              </button>
            </div>

            {/* Printable Ticket Container */}
            <div id="printable-hallticket" className="p-6 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col gap-6 text-left relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-primary-500/5 blur-[40px] pointer-events-none"></div>

              {/* Institution Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-[11px] font-black tracking-tight font-display text-slate-800 uppercase">{selectedTicket.student?.university || 'PlaceTrack University'}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Official Admission Pass</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    VERIFIED
                  </span>
                </div>
              </div>

              {/* Student coordinates & photo */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                {selectedTicket.student?.photo ? (
                  <img
                    src={getUploadUrl(selectedTicket.student.photo)}
                    alt={selectedTicket.student.name}
                    className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                    <User size={26} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate font-display">{selectedTicket.student?.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">ID: {selectedTicket.student?.studentId}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{selectedTicket.student?.degree} - {selectedTicket.student?.department}</p>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">University Email</span>
                  <span className="font-bold text-slate-700 break-all">{selectedTicket.student?.user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Contact Number</span>
                  <span className="font-bold text-slate-700">{selectedTicket.student?.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Applied Drive / Position</span>
                  <span className="font-bold text-slate-700 leading-tight block mt-0.5">{selectedTicket.job?.title}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 block">{selectedTicket.company?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Event Date</span>
                  <span className="font-bold text-slate-700 block mt-0.5">{new Date(selectedTicket.drive?.driveDate || selectedTicket.appliedDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* QR Verification Segment */}
              <div className="mt-2 border-t border-slate-200 pt-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-700 font-display">Venues & Entry QR Verification</p>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                    Scan this QR code to verify coordinates, photo identity, and selection round logs at the placement cell checking desk.
                  </p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      window.location.origin + '/verify-ticket/' + selectedTicket._id
                    )}`}
                    alt="Verification QR"
                    className="h-20 w-20"
                  />
                </div>
              </div>
            </div>

            {/* Print & Action Controls */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  const printContents = document.getElementById('printable-hallticket').innerHTML;
                  const originalContents = document.body.innerHTML;
                  
                  document.body.innerHTML = `
                    <div style="padding: 40px; font-family: sans-serif; color: #1e293b; max-width: 450px; margin: 0 auto;">
                      ${printContents}
                    </div>
                  `;
                  window.print();
                  
                  document.body.innerHTML = originalContents;
                  window.location.reload();
                }}
                className="flex-1 gap-2"
              >
                <Printer size={14} /> Print Pass
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedTicket(null)}
                className="px-6"
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHallTickets;
