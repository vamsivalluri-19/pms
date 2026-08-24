import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api, { getUploadUrl } from '../../services/api.js';
import { Button, LoadingSpinner, EmptyState, Badge } from '../../components/UI.jsx';
import { Award, Printer, User, Calendar, Briefcase, MapPin, DollarSign, QrCode } from 'lucide-react';

const StudentHallTickets = () => {
  const { profile } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/applications');
      if (data.success) {
        // Only show drives where hall ticket has been released/generated
        const activeTickets = (data.applications || []).filter(
          (app) => app.hallTicketGenerated === true && app.status !== 'Rejected'
        );
        setApplications(activeTickets);
      }
    } catch (err) {
      console.error('Error fetching student hall tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);



  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 font-display">My Hall Tickets</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Access, preview and download QR-secured venue admission keys released by the Placement Cell
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
          <EmptyState
            title="No Released Hall Tickets"
            message="Your admission passes will appear here once placement coordinators authorize and release them for matching drives."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-[-30%] right-[-30%] w-[50%] h-[50%] rounded-full bg-primary-500/5 blur-[40px] pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
              
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-600 text-white font-extrabold flex items-center justify-center text-sm font-display uppercase shrink-0">
                    {app.company?.name ? app.company.name[0] : 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{app.job?.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                      {app.company?.name}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-500 border-t border-slate-50 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-slate-400" /> Package</span>
                    <span className="font-bold text-slate-700">{app.job?.ctc || 6.0} LPA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> Location</span>
                    <span className="font-semibold text-slate-600">{app.job?.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> Drive Date</span>
                    <span className="font-semibold text-slate-600">
                      {app.drive?.driveDate ? new Date(app.drive.driveDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-50 pt-4">
                <Button
                  variant="primary"
                  onClick={() => setSelectedTicket(app)}
                  className="w-full gap-2 text-xs py-2 shadow-lg shadow-primary-500/10 cursor-pointer"
                >
                  <Printer size={14} /> Download Hall Ticket
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <span className="font-bold font-display text-sm text-slate-800">Candidate Hall Ticket</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer font-display"
              >
                ×
              </button>
            </div>

            {/* Printable Container */}
            <div id="printable-hallticket" className="p-6 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col gap-6 text-left relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-primary-500/5 blur-[40px] pointer-events-none"></div>

              {/* Institution Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-[11px] font-black tracking-tight font-display text-slate-800 uppercase">{profile?.university || 'PlaceTrack University'}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Official Admission Pass</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    APPROVED
                  </span>
                </div>
              </div>

              {/* Student coordinates & photo */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                {profile?.photo ? (
                  <img
                    src={getUploadUrl(profile.photo)}
                    alt={profile.name}
                    className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                    <User size={26} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate font-display">{profile?.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">ID: {profile?.studentId}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{profile?.degree} - {profile?.department}</p>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">University Email</span>
                  <span className="font-bold text-slate-700 break-all">{profile?.user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Contact Number</span>
                  <span className="font-bold text-slate-700">{profile?.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Applied Drive / Position</span>
                  <span className="font-bold text-slate-700 leading-tight block mt-0.5">{selectedTicket.job?.title}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 block">{selectedTicket.company?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Event Date</span>
                  <span className="font-bold text-slate-700 block mt-0.5">
                    {new Date(selectedTicket.drive?.driveDate || selectedTicket.appliedDate).toLocaleDateString()}
                  </span>
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

            {/* Action buttons */}
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
