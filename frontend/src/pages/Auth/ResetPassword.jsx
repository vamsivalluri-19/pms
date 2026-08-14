import React, { useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { Button, Input } from '../../components/UI.jsx';
import { GraduationCap, ArrowLeft, ShieldCheck, Cpu, Zap, Key } from 'lucide-react';
import bgImg from '../../assets/auth_background.png';

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState(searchParams.get('message') || '');
  const [debugOtp, setDebugOtp] = useState(searchParams.get('debugOtp') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!password || !confirmPassword || (!token && (!email || !otp))) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(token ? `/auth/reset-password/${token}` : '/auth/reset-password', token ? { password } : { email, otp, password });
      setLoading(false);
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Token is invalid or has expired.');
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
            Security Service
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight">
            Establish Your New Access Credentials
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ensure your account security by generating a robust, multi-character password to access the placement system.
          </p>

          <div className="mt-8 flex flex-col gap-4 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Cpu size={16} />
              </div>
              <span>Cryptographic Salted Hash Storage System</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck size={16} />
              </div>
              <span>Secure Authentication & Auto-Wipe Token</span>
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
              <h2 className="text-2xl font-bold text-slate-800 font-display">Verify & Reset Password</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1.5 mb-8">Enter the six-digit code sent to <span className="text-slate-600">{email || 'your email'}</span>, then set a new password.</p>

              {infoMessage && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 text-center">
                  {infoMessage}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-500 text-center animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
                {!token && <Input
                  label="Six-Digit Verification Code"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  required
                />}
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />

                <Button variant="primary" type="submit" className="w-full mt-3 py-3 shadow-md bg-primary-600 hover:bg-primary-700" disabled={loading}>
                  {loading ? 'Updating password...' : 'Update Password'}
                </Button>
              </form>

              {debugOtp && (
                <div className="mt-6 pt-6 border-t border-slate-100 text-center animate-page-enter">
                  <button
                    type="button"
                    onClick={() => alert(`[Developer Mode] Your reset OTP code is: ${debugOtp}`)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200/60 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck size={12} className="text-indigo-500" />
                    Show OTP (Developer Mode)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center flex flex-col items-center gap-4 py-8 animate-page-enter">
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full w-fit">
                <Key size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-display mt-2">Password Updated</h2>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mt-1">
                Your credentials have been successfully updated. You can now use your new password to sign in.
              </p>
              <Link to="/login" className="w-full mt-6">
                <Button variant="primary" className="w-full py-3">
                  Sign In Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
