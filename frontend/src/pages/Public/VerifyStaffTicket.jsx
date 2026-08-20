import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { LoadingSpinner, Button } from '../../components/UI.jsx';
import { ShieldCheck, AlertTriangle, User, Calendar, Phone, Mail, CheckCircle2 } from 'lucide-react';

const VerifyStaffTicket = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaffVerificationDetails = async () => {
      try {
        const { data } = await api.get(`/staff-tickets/public/verify/${ticketId}`);
        if (data.success) {
          setTicket(data.staffTicket);
        } else {
          setError('Invalid staff ticket or staff ticket expired.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to verify staff coordinator credentials.');
      } finally {
        setLoading(false);
      }
    };
    fetchStaffVerificationDetails();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <LoadingSpinner />
        <p className="mt-4 text-xs font-semibold text-slate-400">Verifying staff credentials authenticity...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-30%] w-[60%] h-[60%] rounded-full bg-rose-500/10 blur-[50px]"></div>
          <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 mb-6 border border-rose-500/20">
            <AlertTriangle size={36} />
          </div>
          <h2 className="text-xl font-bold font-display text-white mb-2">Invalid Staff Pass</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-8">
            The scanned QR code points to an invalid, modified, or expired placement operations coordination pass.
          </p>
          <Button variant="secondary" onClick={() => navigate('/')} className="w-full text-slate-300 border-slate-700 hover:bg-slate-800">
            Back to Platform Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-6 py-12 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800/80 text-center flex flex-col shadow-2xl relative z-10">
        
        {/* Verification Status Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20 animate-pulse">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-xl font-black tracking-tight font-display text-white uppercase tracking-wider">Staff Credentials Authorized</h2>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Official Event Pass Validated</p>
        </div>

        {/* Staff Profile Info Row */}
        <div className="flex flex-col items-center gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/60 mb-6">
          <div className="h-24 w-24 rounded-full bg-slate-800 text-emerald-500 border-4 border-slate-800 shadow-md flex items-center justify-center">
            <User size={42} />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-white font-display">{ticket.name}</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-slate-400 font-bold uppercase tracking-wider bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full text-emerald-400">
              {ticket.role}
            </span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="flex flex-col gap-4 text-xs text-left mb-8 border-b border-slate-800 pb-6">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1">Security Verification Profile</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Employee/Volunteer ID</span>
              <span className="font-bold text-slate-200 block mt-0.5">{ticket.staffId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Contact Number</span>
              <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                <Phone size={12} className="text-slate-500" /> {ticket.phone || 'N/A'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-500 font-semibold block">Official Email</span>
              <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5 break-all">
                <Mail size={12} className="text-slate-500 shrink-0" /> {ticket.email}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3 mt-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display">Event Duty Scope</p>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Designated Drive assignment</span>
              <span className="font-bold text-slate-200 block mt-0.5 leading-snug">{ticket.driveName}</span>
            </div>
          </div>
        </div>

        {/* Back navigation buttons */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] text-slate-500 italic leading-snug flex items-center justify-center gap-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <CheckCircle2 size={12} className="text-emerald-500" /> Staff security clearance authorized.
          </div>
          <Button variant="secondary" onClick={() => navigate('/')} className="mt-2 text-slate-400 border-slate-800 hover:bg-slate-800 w-full text-xs font-bold">
            Close Panel
          </Button>
        </div>

      </div>
    </div>
  );
};

export default VerifyStaffTicket;
