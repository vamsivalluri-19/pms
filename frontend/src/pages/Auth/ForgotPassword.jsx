import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button, Input } from '../../components/UI.jsx';
import { GraduationCap, ArrowLeft, ShieldCheck, Cpu, Zap, MailOpen } from 'lucide-react';
import bgImg from '../../assets/auth_background.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setLoading(false);
      if (data.success) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}&message=${encodeURIComponent(data.message || '')}&debugOtp=${encodeURIComponent(data.debugOtp || '')}`);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to send password reset request.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-hidden text-left">
      {/* Left side: Premium branding & graphics */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-7/12 bg-cover bg-center relative items-center p-16 select-none"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-indigo-950/70 backdrop-blur-xs"></div>
        
        <div className="absolute top-12 left-12 flex items-center gap-2 z-10 text-white font-bold tracking-tight font-display">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <GraduationCap size={20} className="text-blue-400" />
          </div>
          <span>PlaceTrack Office</span>
        </div>

        <div className="relative z-10 text-white max-w-xl flex flex-col gap-6">
          <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full w-fit">
            Account Self-Service
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight">
            Recover Your Platform Access Securely
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Enter your registered email address to receive an authentication handshake and reset your credentials.
          </p>

          <div className="mt-8 flex flex-col gap-4 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Cpu size={16} />
              </div>
              <span>Secured Reset Token Signature Handshake</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Zap size={16} />
              </div>
              <span>Instant Fallback Verification Flow</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center text-[10px] text-slate-400 z-10 font-bold uppercase tracking-wider">
          <span>© 2026 PLACETRACK</span>
          <span>SYSTEM OPERATIONS ACTIVE</span>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white relative z-10">
        <div className="max-w-md w-full flex flex-col justify-center">
          <div className="flex md:hidden items-center gap-2 mb-8 text-slate-800 font-bold tracking-tight font-display">
            <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
              <GraduationCap size={20} />
            </div>
            <span>PlaceTrack Office</span>
          </div>

          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>

          {!success ? (
            <>
              <h2 className="text-2xl font-bold text-slate-800 font-display">Forgot Password?</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1.5 mb-8">No worries. We’ll send a six-digit verification code to your email.</p>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-500 text-center animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="e.g. name@placetrack.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />

                <Button variant="primary" type="submit" className="w-full mt-3 py-3 shadow-md bg-primary-600 hover:bg-primary-700" disabled={loading}>
                  {loading ? 'Sending code...' : 'Send Verification Code'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center flex flex-col items-center gap-4 py-8 animate-page-enter">
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full w-fit">
                <MailOpen size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-display mt-2">Check Your Email</h2>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mt-1">
                If the email exists in our records, we have sent a secure password reset link to <strong className="text-slate-700">{email}</strong>.
              </p>
              <p className="text-[10px] text-amber-600 bg-amber-50 px-3 py-2 rounded-xl mt-2 max-w-xs font-semibold leading-relaxed border border-amber-100">
                Note: In development fallback mode, look at the backend terminal logs to access the reset URL token.
              </p>
              <Link to="/login" className="w-full mt-6">
                <Button variant="secondary" className="w-full py-3">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
