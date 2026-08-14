import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Button, Input, Select } from '../../components/UI.jsx';
import { GraduationCap, ArrowLeft, Briefcase, ShieldCheck, Cpu, Zap } from 'lucide-react';
import bgImg from '../../assets/auth_background.png';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [role, setRole] = useState('STUDENT'); // STUDENT or COMPANY
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student specific profile data
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [department, setDepartment] = useState('CSE');
  const [cgpa, setCgpa] = useState('');

  // Recruiter specific profile data
  const [companyName, setCompanyName] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterPhone, setRecruiterPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    let profileData = {};
    if (role === 'STUDENT') {
      profileData = {
        name,
        studentId,
        degree,
        department,
        cgpa: parseFloat(cgpa) || 0
      };
      if (!name || !studentId || !cgpa) {
        setError('Please fill in all student credentials.');
        setLoading(false);
        return;
      }
    } else if (role === 'COMPANY') {
      profileData = {
        name: companyName,
        recruiterName,
        recruiterEmail: email,
        recruiterPhone
      };
      if (!companyName || !recruiterName) {
        setError('Please fill in all company credentials.');
        setLoading(false);
        return;
      }
    } else if (role === 'PLACEMENT_MANAGER') {
      profileData = {
        name,
        department
      };
      if (!name || !department) {
        setError('Please fill in all manager credentials.');
        setLoading(false);
        return;
      }
    }

    const res = await register(email, password, role, profileData);
    setLoading(false);

    if (res.success) {
      if (res.isVerified === false) {
        navigate(`/verify-email?email=${encodeURIComponent(res.email)}&message=${encodeURIComponent(res.message || '')}&debugOtp=${encodeURIComponent(res.debugOtp || '')}`);
      } else {
        const lowerRole = res.role.toLowerCase();
        if (lowerRole === 'placement_manager') {
          navigate('/manager/dashboard');
        } else {
          navigate(`/${lowerRole}/dashboard`);
        }
      }
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-shell min-h-screen flex flex-col md:flex-row relative overflow-hidden text-left">
      {/* Left side: Premium branding & graphics */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-5/12 bg-cover bg-center relative items-center p-16 select-none shrink-0"
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

        <div className="relative z-10 text-white max-w-sm flex flex-col gap-5">
          <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full w-fit">
            Fast Track Onboarding
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight font-display leading-tight">
            Register Your Campus Profile
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Create your account to unlock eligible drives dashboards, configure active recruiter campaigns, and manage institutional scorecards.
          </p>

          <div className="mt-8 flex flex-col gap-4 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Cpu size={14} />
              </div>
              <span>Student & Recruiter Integrated Portals</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Zap size={14} />
              </div>
              <span>Automated Verification Systems</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck size={14} />
              </div>
              <span>Enterprise-grade Security Standard</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center text-[10px] text-slate-400 z-10 font-bold uppercase tracking-wider">
          <span>© 2026 PLACETRACK</span>
          <span>SYSTEM OPERATIONS ACTIVE</span>
        </div>
      </div>

      {/* Right side: Fields Forms */}
      <div className="auth-panel flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10 overflow-y-auto max-h-screen">
        <div className="max-w-lg w-full flex flex-col justify-center my-auto">
          {/* Mobile header */}
          <div className="flex md:hidden items-center gap-2 mb-8 text-slate-800 font-bold tracking-tight font-display">
            <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
              <GraduationCap size={20} />
            </div>
            <span>PlaceTrack Office</span>
          </div>

          {/* Back Home link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h2 className="text-2xl font-bold text-slate-800 font-display">Create Account</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1 mb-6">Join the campus recruitment coordinator portal</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-500 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Visual Cards Selector for Roles */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div
              onClick={() => { setRole('STUDENT'); setError(''); }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                role === 'STUDENT'
                  ? 'border-primary-500 bg-primary-50/50 shadow-sm text-primary-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-400 bg-white/30'
              }`}
            >
              <GraduationCap size={20} className={role === 'STUDENT' ? 'text-primary-500' : 'text-slate-400'} />
              <span className="text-[11px] font-bold font-display">Student</span>
            </div>

            <div
              onClick={() => { setRole('COMPANY'); setError(''); }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                role === 'COMPANY'
                  ? 'border-primary-500 bg-primary-50/50 shadow-sm text-primary-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-400 bg-white/30'
              }`}
            >
              <Briefcase size={18} className={role === 'COMPANY' ? 'text-primary-500' : 'text-slate-400'} />
              <span className="text-[11px] font-bold font-display">Recruiter</span>
            </div>

            <div
              onClick={() => { setRole('PLACEMENT_MANAGER'); setError(''); setName(''); setDepartment(''); }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                role === 'PLACEMENT_MANAGER'
                  ? 'border-primary-500 bg-primary-50/50 shadow-sm text-primary-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-400 bg-white/30'
              }`}
            >
              <ShieldCheck size={20} className={role === 'PLACEMENT_MANAGER' ? 'text-primary-500' : 'text-slate-400'} />
              <span className="text-[11px] font-bold font-display">Manager</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
            {/* Base credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@placetrack.com"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <div className="hidden sm:block"></div>
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <hr className="border-slate-100 my-1" />

            {/* Student Role Fields */}
            {role === 'STUDENT' ? (
              <div className="flex flex-col gap-4 animate-page-enter">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px] font-display">Academic Profiles</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Input
                    label="Student ID / Roll No"
                    placeholder="e.g. PT-2022005"
                    autoComplete="off"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Select
                    label="Degree Programme"
                    options={[
                      { value: 'B.Tech', label: 'Bachelor of Technology (B.Tech)' },
                      { value: 'MCA', label: 'Master of Computer Applications (MCA)' },
                      { value: 'MBA', label: 'Master of Business Administration (MBA)' }
                    ]}
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    disabled={loading}
                  />
                  <Select
                    label="Department / Branch"
                    options={[
                      { value: 'CSE', label: 'Computer Science (CSE)' },
                      { value: 'IT', label: 'Information Technology (IT)' },
                      { value: 'ECE', label: 'Electronics (ECE)' }
                    ]}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={loading}
                  />
                  <Input
                    label="Current CGPA (0 - 10)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.45"
                    autoComplete="off"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            ) : role === 'COMPANY' ? (
              /* Recruiter Role Fields */
              <div className="flex flex-col gap-4 animate-page-enter">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px] font-display">Corporate Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    placeholder="e.g. Microsoft"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Input
                    label="Recruiter Contact Name"
                    placeholder="Enter contact name"
                    autoComplete="name"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Input
                    label="Recruiter Contact Phone"
                    placeholder="e.g. +91 99887 76655"
                    autoComplete="tel"
                    value={recruiterPhone}
                    onChange={(e) => setRecruiterPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            ) : (
              /* Placement Manager Role Fields */
              <div className="flex flex-col gap-4 animate-page-enter">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px] font-display">Institutional Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Input
                    label="Department / Office"
                    placeholder="e.g. Corporate Relations"
                    autoComplete="organization-title"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            <Button variant="primary" type="submit" className="w-full mt-2 py-3 shadow-md bg-primary-600 hover:bg-primary-700" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-semibold font-display">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-500 hover:text-primary-600">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
//
