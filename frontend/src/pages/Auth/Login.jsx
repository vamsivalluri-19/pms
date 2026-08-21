import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Button, Input, Select } from '../../components/UI.jsx';
import { GraduationCap, ArrowLeft, ShieldCheck, Cpu, Zap, Briefcase, UserCheck } from 'lucide-react';
import bgImg from '../../assets/auth_background.png';

const GOOGLE_SCRIPT_ID = 'placetrack-google-gsi-script';
const GOOGLE_INIT_CLIENT_KEY = '__placetrackGoogleInitClientId';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleAuthLogin, googleAuthRegister } = useContext(AuthContext);
  
  const [role, setRole] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const roleStyle = {
    STUDENT: { active: 'border-blue-500 bg-blue-50 text-blue-600 shadow-blue-500/10', icon: 'text-blue-500', label: 'Launch your career' },
    COMPANY: { active: 'border-violet-500 bg-violet-50 text-violet-600 shadow-violet-500/10', icon: 'text-violet-500', label: 'Build your talent pipeline' },
    PLACEMENT_MANAGER: { active: 'border-teal-500 bg-teal-50 text-teal-700 shadow-teal-500/10', icon: 'text-teal-600', label: 'Orchestrate campus outcomes' },
    ADMIN: { active: 'border-amber-500 bg-amber-50 text-amber-700 shadow-amber-500/10', icon: 'text-amber-600', label: 'Secure system administration' }
  }[role];

  // Google Login and Onboarding States
  const [googleCredential, setGoogleCredential] = useState('');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [newGoogleEmail, setNewGoogleEmail] = useState('');
  const [newGoogleName, setNewGoogleName] = useState('');
  const [googleBlocked, setGoogleBlocked] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const [onboardRole, setOnboardRole] = useState('STUDENT');
  const [onboardName, setOnboardName] = useState('');
  const [onboardStudentId, setOnboardStudentId] = useState('');
  const [onboardDegree, setOnboardDegree] = useState('B.Tech');
  const [onboardDepartment, setOnboardDepartment] = useState('CSE');
  const [onboardCgpa, setOnboardCgpa] = useState('');
  
  const [onboardCompanyName, setOnboardCompanyName] = useState('');
  const [onboardRecruiterName, setOnboardRecruiterName] = useState('');
  const [onboardRecruiterPhone, setOnboardRecruiterPhone] = useState('');

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    const idToken = response.credential;
    setGoogleCredential(idToken);
    
    setLoading(true);
    const res = await googleAuthLogin(idToken);
    setLoading(false);

    if (res.success) {
      if (res.isNewUser) {
        setNewGoogleEmail(res.email);
        setNewGoogleName(res.name);
        setOnboardName(res.name);
        setOnboardRecruiterName(res.name);
        setShowOnboardingModal(true);
      } else {
        const roleName = res.role.toLowerCase();
        if (roleName === 'placement_manager') {
          navigate('/manager/dashboard');
        } else {
          navigate(`/${roleName}/dashboard`);
        }
      }
    } else {
      setError(res.message || 'Google Sign-In failed');
    }
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    // Render Google whenever the browser client ID is configured. The API still
    // validates every credential and returns a safe setup error if needed.
    setGoogleEnabled(true);
  }, []);

  useEffect(() => {
    if (!googleEnabled) return undefined;
    return loadGoogleSignIn(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  }, [googleEnabled]);

  const loadGoogleSignIn = (googleClientId) => {
    const initAndRenderButton = () => {
      if (!window.google?.accounts?.id) {
        setGoogleBlocked(true);
        return;
      }

      try {
        console.log("[PlaceTrack OAuth Debug] Initializing Google Sign-In GSI SDK");
        console.log("[PlaceTrack OAuth Debug] Sending Client ID:", googleClientId);
        console.log("[PlaceTrack OAuth Debug] Client window origin:", window.location.origin);

        if (window[GOOGLE_INIT_CLIENT_KEY] !== googleClientId) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse
          });
          window[GOOGLE_INIT_CLIENT_KEY] = googleClientId;
        }

        const buttonContainer = document.getElementById('google-signin-btn');
        if (!buttonContainer) return;
        buttonContainer.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          width: 320
        });
      } catch (err) {
        console.error('Google initialization error:', err);
        setGoogleBlocked(true);
      }
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      if (window.google?.accounts?.id) {
        initAndRenderButton();
      } else {
        existingScript.addEventListener('load', initAndRenderButton, { once: true });
      }
      return undefined;
    }

    // Load Google Identity Services SDK dynamically once per page.
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initAndRenderButton;
    script.onerror = () => {
      setGoogleBlocked(true);
    };
    document.body.appendChild(script);

    return undefined;
  };

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
      const roleName = res.role.toLowerCase();
      if (roleName === 'placement_manager') {
        navigate('/manager/dashboard');
      } else {
        navigate(`/${roleName}/dashboard`);
      }
    } else {
      if (res.isVerified === false) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}&message=${encodeURIComponent(res.message || '')}&debugOtp=${encodeURIComponent(res.debugOtp || '')}`);
      } else {
        setError(res.message || 'Invalid email or password');
      }
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let profileData = {};
    if (onboardRole === 'STUDENT') {
      profileData = {
        name: onboardName || newGoogleName,
        studentId: onboardStudentId,
        degree: onboardDegree,
        department: onboardDepartment,
        cgpa: parseFloat(onboardCgpa) || 0
      };
      if (!profileData.studentId || !profileData.cgpa) {
        setError('Please enter Student ID and CGPA.');
        return;
      }
    } else {
      profileData = {
        name: onboardCompanyName,
        recruiterName: onboardRecruiterName || newGoogleName,
        recruiterPhone: onboardRecruiterPhone
      };
      if (!profileData.name || !profileData.recruiterName) {
        setError('Please enter Company Name and Recruiter Name.');
        return;
      }
    }

    setLoading(true);
    const res = await googleAuthRegister(googleCredential, onboardRole, profileData);
    setLoading(false);

    if (res.success) {
      setShowOnboardingModal(false);
      const roleName = res.role.toLowerCase();
      if (roleName === 'placement_manager') {
        navigate('/manager/dashboard');
      } else {
        navigate(`/${roleName}/dashboard`);
      }
    } else {
      setError(res.message || 'Google registration failed');
    }
  };

  return (
    <div className="auth-shell min-h-screen flex flex-col md:flex-row relative overflow-hidden text-left">
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
            Next-Gen Placement Management
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight">
            Connecting Talent With Top Corporate Partners
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Verify academic credentials, analyze resume indexes with local AI, schedule live interview streams, and track results within a single automated workspace.
          </p>

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
      <div className="auth-panel flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-md w-full flex flex-col justify-center my-auto">
          <div className="flex md:hidden items-center gap-2 mb-8 text-slate-800 font-bold tracking-tight font-display">
            <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
              <GraduationCap size={20} />
            </div>
            <span>PlaceTrack Office</span>
          </div>

          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h2 className="text-2xl font-bold text-slate-800 font-display">Secure Sign In</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1.5">Access the Smart Campus Placement Management Platform</p>
          <p className={`text-[11px] font-bold mt-2 mb-8 ${roleStyle.icon}`}>{roleStyle.label}</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-500 text-center animate-shake">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {['STUDENT', 'COMPANY', 'PLACEMENT_MANAGER', 'ADMIN'].map((roleType) => (
              <div
                key={roleType}
                onClick={() => setRole(roleType)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                  role === roleType
                    ? `${roleStyle.active} shadow-lg`
                    : 'border-slate-200 hover:border-slate-300 text-slate-400 bg-white/30'
                }`}
              >
                {roleType === 'STUDENT' && <GraduationCap size={18} className={role === 'STUDENT' ? roleStyle.icon : 'text-slate-400'} />}
                {roleType === 'COMPANY' && <Briefcase size={18} className={role === 'COMPANY' ? roleStyle.icon : 'text-slate-400'} />}
                {roleType === 'PLACEMENT_MANAGER' && <ShieldCheck size={18} className={role === 'PLACEMENT_MANAGER' ? roleStyle.icon : 'text-slate-400'} />}
                {roleType === 'ADMIN' && <UserCheck size={18} className={role === 'ADMIN' ? roleStyle.icon : 'text-slate-400'} />}
                <span className="text-[10px] font-bold font-display capitalize">
                  {roleType.replace('_', ' ').toLowerCase()}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
            <Input
              label="Account Email"
              type="email"
              placeholder="e.g. name@placetrack.com"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
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

          {/* Google is only displayed when matching frontend and backend credentials are configured. */}
          {googleEnabled && <><div className="relative my-6 text-center text-xs">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative bg-white px-4 text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
              Or continue with
            </span>
          </div>

          {googleBlocked && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-semibold text-center mb-4 leading-normal">
              ⚠️ Google Sign-In is blocked. Please disable your adblocker, pop-up blocker, or Brave shields on this page, then refresh.
            </div>
          )}

          <div id="google-signin-btn" className="w-full flex justify-center py-1"></div>
          
          <p className="text-[9.5px] text-slate-400 font-medium leading-normal text-center mt-2.5 max-w-xs mx-auto">
            Note: If you encounter a Google OAuth <code>origin_mismatch</code> error, please sign in using your college email and password above.
          </p>
          </>}

          <p className="mt-8 text-center text-xs text-slate-400 font-semibold">
            Don't have a workspace?{' '}
            <Link to="/register" className="font-bold text-primary-500 hover:text-primary-600">
              Register Account
            </Link>
          </p>
        </div>
      </div>

      {/* Onboarding Role Dialog Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowOnboardingModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl flex flex-col z-10 animate-page-enter max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-lg font-bold text-slate-800 font-display mb-1">Onboard Your Account</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">Choose your campus role to finalize your Google profile setup.</p>
            
            <form onSubmit={handleOnboardSubmit} className="flex flex-col gap-5 text-left">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setOnboardRole('STUDENT')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                    onboardRole === 'STUDENT'
                      ? 'border-primary-500 bg-primary-50/50 text-primary-600 font-bold'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <GraduationCap size={22} className="mx-auto mb-1.5" />
                  <p className="font-display">Student</p>
                </div>
                <div
                  onClick={() => setOnboardRole('COMPANY')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                    onboardRole === 'COMPANY'
                      ? 'border-primary-500 bg-primary-50/50 text-primary-600 font-bold'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <Briefcase size={20} className="mx-auto mb-2" />
                  <p className="font-display">Recruiter</p>
                </div>
              </div>

              <hr className="border-slate-100 my-2" />

              {/* Student Onboarding Fields */}
              {onboardRole === 'STUDENT' ? (
                <div className="flex flex-col gap-4 animate-page-enter">
                  <Input
                    label="Full Name"
                    autoComplete="name"
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    required
                  />
                  <Input
                    label="Student ID / Roll No"
                    placeholder="e.g. PT-2022005"
                    value={onboardStudentId}
                    onChange={(e) => setOnboardStudentId(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Degree"
                      options={[
                        { value: 'B.Tech', label: 'B.Tech' },
                        { value: 'MCA', label: 'MCA' },
                        { value: 'MBA', label: 'MBA' }
                      ]}
                      value={onboardDegree}
                      onChange={(e) => setOnboardDegree(e.target.value)}
                    />
                    <Select
                      label="Department"
                      options={[
                        { value: 'CSE', label: 'Computer Science' },
                        { value: 'IT', label: 'Information Tech' },
                        { value: 'ECE', label: 'Electronics' }
                      ]}
                      value={onboardDepartment}
                      onChange={(e) => setOnboardDepartment(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Current CGPA (0 - 10)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.45"
                    value={onboardCgpa}
                    onChange={(e) => setOnboardCgpa(e.target.value)}
                    required
                  />
                </div>
              ) : (
                /* Recruiter Onboarding Fields */
                <div className="flex flex-col gap-4 animate-page-enter">
                  <Input
                    label="Company Name"
                    placeholder="e.g. Microsoft"
                    value={onboardCompanyName}
                    onChange={(e) => setOnboardCompanyName(e.target.value)}
                    required
                  />
                  <Input
                    label="Recruiter Name"
                    autoComplete="name"
                    value={onboardRecruiterName}
                    onChange={(e) => setOnboardRecruiterName(e.target.value)}
                    required
                  />
                  <Input
                    label="Recruiter Phone"
                    placeholder="e.g. +91 99887 76655"
                    value={onboardRecruiterPhone}
                    onChange={(e) => setOnboardRecruiterPhone(e.target.value)}
                  />
                </div>
              )}

              <Button variant="primary" type="submit" className="w-full mt-4 py-3 shadow-md bg-primary-600 hover:bg-primary-700" disabled={loading}>
                {loading ? 'Completing onboarding...' : 'Onboard Profile'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
