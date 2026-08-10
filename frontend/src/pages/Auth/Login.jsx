import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Button, Input } from '../../components/UI.jsx';
import { GraduationCap, ArrowLeft, ShieldCheck, Cpu, Zap, Briefcase, UserCheck } from 'lucide-react';
import bgImg from '../../assets/auth_background.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [role, setRole] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const role = res.role.toLowerCase();
      if (role === 'placement_manager') {
        navigate('/manager/dashboard');
      } else {
        navigate(`/${role}/dashboard`);
      }
    } else {
      setError(res.message || 'Invalid email or password');
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
            Next-Gen Placement Management
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight">
            Connecting Talent With Top Corporate Partners
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Verify academic credentials, analyze resume indexes with local AI, schedule live interview streams, and track results within a single automated workspace.
          </p>

          {/* Quick list of highlights */}
          <div className="mt-8 flex flex-col gap-4 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Cpu size={16} />
              </div>
              <span>AI Resume Screening & Scorecard Aggregator</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Zap size={16} />
              </div>
              <span>Instant Academic Eligibility Filter Matching Engine</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck size={16} />
              </div>
              <span>Chronicle Audited & Secure Workspace</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center text-[10px] text-slate-400 z-10 font-bold uppercase tracking-wider">
          <span>© 2026 PLACETRACK</span>
          <span>SYSTEM OPERATIONS ACTIVE</span>
        </div>
      </div>

      {/* Right side: Credentials form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white relative z-10">
        <div className="max-w-md w-full flex flex-col justify-center">
          {/* Mobile only header branding */}
          <div className="flex md:hidden items-center gap-2 mb-8 text-slate-800 font-bold tracking-tight font-display">
            <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
              <GraduationCap size={20} />
            </div>
            <span>PlaceTrack Office</span>
          </div>

          {/* Back Home link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h2 className="text-2xl font-bold text-slate-800 font-display">Secure Sign In</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 mb-8">Access the Smart Campus Placement Management Platform</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-500 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Visual Cards Selector for Roles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div
              onClick={() => { setRole('STUDENT'); }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                role === 'STUDENT'
                  ? 'border-primary-500 bg-primary-50/50 shadow-sm text-primary-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-400 bg-white/30'
              }`}
            >
              <GraduationCap size={18} className={role === 'STUDENT' ? 'text-primary-500' : 'text-slate-400'} />
              <span className="text-[10px] font-bold font-display">Student</span>
            </div>

            <div
              onClick={() => { setRole('COMPANY'); }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                role === 'COMPANY'
                  ? 'border-primary-500 bg-primary-50/50 shadow-sm text-primary-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-400 bg-white/30'
              }`}
            >
              <Briefcase size={18} className={role === 'COMPANY' ? 'text-primary-500' : 'text-slate-400'} />
              <span className="text-[10px] font-bold font-display">Recruiter</span>
            </div>

            <div
              onClick={() => { setRole('PLACEMENT_MANAGER'); }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                role === 'PLACEMENT_MANAGER'
                  ? 'border-primary-500 bg-primary-50/50 shadow-sm text-primary-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-400 bg-white/30'
              }`}
            >
              <ShieldCheck size={18} className={role === 'PLACEMENT_MANAGER' ? 'text-primary-500' : 'text-slate-400'} />
              <span className="text-[10px] font-bold font-display">Manager</span>
            </div>

            <div
              onClick={() => { setRole('ADMIN'); }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                role === 'ADMIN'
                  ? 'border-primary-500 bg-primary-50/50 shadow-sm text-primary-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-400 bg-white/30'
              }`}
            >
              <UserCheck size={18} className={role === 'ADMIN' ? 'text-primary-500' : 'text-slate-400'} />
              <span className="text-[10px] font-bold font-display">Admin</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
            <Input
              label="Account Email"
              type="email"
              placeholder="e.g. name@placetrack.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
                <input type="checkbox" className="rounded border-slate-300 text-primary-500 focus:ring-primary-500/20" />
                Remember credentials
              </label>
              <Link to="/forgot-password" className="text-primary-500 hover:text-primary-600 cursor-pointer">
                Forgot Password?
              </Link>
            </div>

            <Button variant="primary" type="submit" className="w-full mt-3 py-3 shadow-md bg-primary-600 hover:bg-primary-700" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-semibold">
            Don't have a workspace?{' '}
            <Link to="/register" className="font-bold text-primary-500 hover:text-primary-600">
              Register Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
//
