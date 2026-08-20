import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getUploadUrl } from '../../services/api.js';
import { LoadingSpinner, Badge, Button } from '../../components/UI.jsx';
import { CheckCircle2, AlertTriangle, GraduationCap, Mail, User, ShieldCheck, Calendar, Phone, Award } from 'lucide-react';

const VerifyTicket = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerificationDetails = async () => {
      try {
        const { data } = await api.get(`/applications/public/verify/${applicationId}`);
        if (data.success) {
          setApplication(data.application);
        } else {
          setError('Invalid ticket or ticket expired.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to verify candidate hall ticket.');
      } finally {
        setLoading(false);
      }
    };
    fetchVerificationDetails();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <LoadingSpinner />
        <p className="mt-4 text-xs font-semibold text-slate-400">Verifying hall ticket authenticity...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-30%] w-[60%] h-[60%] rounded-full bg-rose-500/10 blur-[50px]"></div>
          <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 mb-6 border border-rose-500/20">
            <AlertTriangle size={36} />
          </div>
          <h2 className="text-xl font-bold font-display text-white mb-2">Invalid Verification Ticket</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-8">
            The scanned QR code points to an invalid, modified, or expired placement drive hall ticket. Please verify that this candidate has applied successfully.
          </p>
          <Button variant="secondary" onClick={() => navigate('/')} className="w-full text-slate-300 border-slate-700 hover:bg-slate-800">
            Back to Platform Home
          </Button>
        </div>
      </div>
    );
  }

  const { student, company, job, drive } = application;
  const studentPhoto = student?.photo ? getUploadUrl(student.photo) : null;

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
          <h2 className="text-xl font-black tracking-tight font-display text-white uppercase tracking-wider">Candidate Verified</h2>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Official Hall Ticket Authenticated</p>
        </div>

        {/* Student Profile Info Row */}
        <div className="flex flex-col items-center gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/60 mb-6">
          {studentPhoto ? (
            <img src={studentPhoto} alt={student?.name} className="h-24 w-24 rounded-full object-cover border-4 border-slate-800 shadow-md" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-slate-800 text-slate-500 border-4 border-slate-800 shadow-md flex items-center justify-center">
              <User size={42} />
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-white font-display">{student?.name}</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-slate-400 font-semibold">
              <GraduationCap size={14} className="text-slate-500" /> {student?.studentId}
            </span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="flex flex-col gap-4 text-xs text-left mb-8 border-b border-slate-800 pb-6">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display mb-1">Authenticated Candidate Coordinates</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">University Email</span>
              <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5 break-all">
                <Mail size={12} className="text-slate-500 shrink-0" /> {student?.user?.email}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Contact Number</span>
              <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                <Phone size={12} className="text-slate-500" /> {student?.phone || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Department & Degree</span>
              <span className="font-bold text-slate-200 block mt-0.5">{student?.degree} - {student?.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Campus Affiliation</span>
              <span className="font-bold text-slate-200 block mt-0.5 leading-tight">{student?.university || 'PlaceTrack'}</span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3 mt-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-display">Target Placement Event Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Target Job Position</span>
                <span className="font-bold text-slate-200 block mt-0.5">{job?.title} ({company?.name})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Drive Date / Event</span>
                <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                  <Calendar size={12} className="text-slate-500" /> {new Date(drive?.driveDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back navigation buttons */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] text-slate-500 italic leading-snug flex items-center justify-center gap-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <CheckCircle2 size={12} className="text-emerald-500" /> Handheld scan verification successful.
          </div>
          <Button variant="secondary" onClick={() => navigate('/')} className="mt-2 text-slate-400 border-slate-800 hover:bg-slate-800 w-full text-xs font-bold">
            Close Panel
          </Button>
        </div>

      </div>
    </div>
  );
};

export default VerifyTicket;
