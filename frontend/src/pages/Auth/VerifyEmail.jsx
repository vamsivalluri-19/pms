import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Button } from '../../components/UI.jsx';
import { GraduationCap, ArrowLeft, ShieldCheck, Mail, RefreshCw, KeyRound } from 'lucide-react';
import bgImg from '../../assets/auth_background.png';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyOTP, resendOTP } = useContext(AuthContext);

  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(searchParams.get('message') || '');
  const [debugOtp, setDebugOtp] = useState(searchParams.get('debugOtp') || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      setError('No email address provided. Please go back to login/register.');
      return;
    }
  }, [email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await verifyOTP(email, otp);
    setLoading(false);

    if (res.success) {
      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => {
        const role = res.role.toLowerCase();
        if (role === 'placement_manager') {
          navigate('/manager/dashboard');
        } else {
          navigate(`/${role}/dashboard`);
        }
      }, 1500);
    } else {
      setError(res.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setError('');
    setMessage('');
    setResending(true);
    const res = await resendOTP(email);
    setResending(false);

    if (res.success) {
      setMessage(res.message || 'A new verification code has been sent to your email.');
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      setCountdown(60);
    } else {
      setError(res.message || 'Failed to resend verification code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-hidden text-left">
      {/* Left side: Premium branding & graphics */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-7/12 bg-cover bg-center relative items-center p-16 select-none"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        {/* Dark cyber overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-indigo-950/70 backdrop-blur-xs"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-12 left-12 flex items-center gap-2 z-10 text-white font-bold tracking-tight font-display">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <GraduationCap size={20} className="text-blue-400" />
          </div>
          <span>PlaceTrack Office</span>
        </div>

        <div className="relative z-10 text-white max-w-xl flex flex-col gap-6">
          <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full w-fit">
            Account Security
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight">
            Verify Your Email Address
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            We have dispatched a one-time verification passcode (OTP) to your registered email address. This ensures authorized institutional onboarding.
          </p>

          <div className="mt-8 flex flex-col gap-4 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Mail size={16} />
              </div>
              <span>Automated Verification Dispatcher</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck size={16} />
              </div>
              <span>End-to-End Encrypted Session Keys</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center text-[10px] text-slate-400 z-10 font-bold uppercase tracking-wider">
          <span>© 2026 PLACETRACK</span>
          <span>SYSTEM OPERATIONS ACTIVE</span>
        </div>
      </div>

      {/* Right side: Verification form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white relative z-10">
        <div className="max-w-md w-full flex flex-col justify-center">
          {/* Mobile only header branding */}
          <div className="flex md:hidden items-center gap-2 mb-8 text-slate-800 font-bold tracking-tight font-display">
            <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
              <GraduationCap size={20} />
            </div>
            <span>PlaceTrack Office</span>
          </div>

          {/* Back to Login link */}
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>

          <h2 className="text-2xl font-bold text-slate-800 font-display">Confirm OTP</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 mb-8">
            An email with verification code was sent to <strong className="text-slate-700">{email}</strong>
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-500 text-center animate-shake">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600 text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-xs">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <KeyRound size={12} className="text-primary-500" />
                6-Digit Code
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={loading}
                required
                className="w-full text-center text-2xl font-bold tracking-[8px] py-3.5 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800"
              />
            </div>

            <Button variant="primary" type="submit" className="w-full mt-2 py-3 shadow-md bg-primary-600 hover:bg-primary-700" disabled={loading || !email}>
              {loading ? 'Verifying OTP...' : 'Verify Email Address'}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs">
            <p className="text-slate-400 font-semibold mb-3">Didn't receive the code?</p>
            {countdown > 0 ? (
              <span className="text-slate-400 font-bold text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg select-none">
                Resend code in {countdown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 font-bold text-primary-500 hover:text-primary-600 transition-colors cursor-pointer border-none bg-transparent"
              >
                <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                Resend Code
              </button>
            )}
          </div>

          {debugOtp && (
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => alert(`[Developer Mode] Your current OTP code is: ${debugOtp}`)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200/60 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={12} className="text-indigo-500" />
                Show OTP (Developer Mode)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
