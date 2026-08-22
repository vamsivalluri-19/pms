import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Button, Input, Select, Badge } from '../../components/UI.jsx';
import api, { getUploadUrl } from '../../services/api.js';
import {
  User,
  GraduationCap,
  Briefcase,
  FileCheck,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Plus,
  Printer,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { getTemplateCSS, renderTemplateHTML } from '../../components/ResumeTemplates.jsx';

const StudentProfile = () => {
  const location = useLocation();
  const { profile, setProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/student/resume') {
      setActiveTab('resume');
    } else if (path === '/student/documents') {
      setActiveTab('documents');
    } else if (path === '/student/settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('personal');
    }
  }, [location]);

  // Message alert state
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // Settings States
  const { theme, toggleTheme, user } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setAlert({ type: 'danger', msg: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const { data } = await api.put('/auth/change-password', { oldPassword, newPassword });
      if (data.success) {
        setAlert({ type: 'success', msg: 'Password updated successfully.' });
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  // Edit states mapping profile
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [dob, setDob] = useState(profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : '');
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [address, setAddress] = useState(profile?.address || '');

  const [cgpa, setCgpa] = useState(profile?.cgpa || '');
  const [tenth, setTenth] = useState(profile?.tenthPercentage || '');
  const [twelfth, setTwelfth] = useState(profile?.twelfthPercentage || '');
  const [backlogs, setBacklogs] = useState(profile?.activeBacklogs || 0);
  const [department, setDepartment] = useState(profile?.department || 'CSE');
  const [degree, setDegree] = useState(profile?.degree || 'B.Tech');
  const [batch, setBatch] = useState(profile?.batch || '2022-2026');

  // Skill states
  const [skillsText, setSkillsText] = useState(profile?.skills?.join(', ') || '');

  // File Upload & ATS Analysis states
  const [resumeFile, setResumeFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [docName, setDocName] = useState('10th Certificate');
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [analyzingAts, setAnalyzingAts] = useState(false);

  const handleAnalyzeResume = async () => {
    setAnalyzingAts(true);
    try {
      const { data } = await api.get('/ai/resume-analyzer');
      if (data.success) {
        setAtsAnalysis(data.analysis);
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: 'ATS evaluation failed to calculate.' });
    } finally {
      setAnalyzingAts(false);
    }
  };

  // ATS Resume Builder States
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [resumeData, setResumeData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.address || '',
    github: '',
    linkedin: '',
    portfolio: '',
    summary: 'A highly motivated developer with a cumulative CGPA of ' + (profile?.cgpa || '8.5') + '. Experienced in software engineering and web application development. Seeking to leverage technical skills in a challenging placement role.',
    education: [
      { degree: profile?.degree || 'B.Tech', institution: 'Institute of Technology', year: profile?.batch || '2022-2026', gpa: profile?.cgpa || '' }
    ],
    experience: [
      { company: 'Tech Internships', role: 'Software Engineer Intern', duration: 'Jun 2025 - Aug 2025', description: '- Built frontend dashboards using React and TailwindCSS.\n- Refactored server APIs to decrease load times.' }
    ],
    projects: [
      { title: 'PlaceTrack Application', technologies: 'React, Node.js, MongoDB', description: '- Engineered real-time recruiter statistics and notifications.\n- Integrated WebRTC-based local video meeting call features.', link: 'https://github.com' }
    ],
    achievements: [
      { description: 'Received 1st place award in national university coding hackathon.' }
    ],
    certifications: [
      { name: 'Certified Full-Stack Developer', authority: 'Coursera' }
    ],
    skills: profile?.skills || []
  });

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', gpa: '' }]
    }));
  };

  const removeEducation = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index)
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index)
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', technologies: '', description: '', link: '' }]
    }));
  };

  const removeProject = (index) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  const addAchievement = () => {
    setResumeData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { description: '' }]
    }));
  };

  const removeAchievement = (index) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, idx) => idx !== index)
    }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', authority: '' }]
    }));
  };

  const removeCertification = (index) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index)
    }));
  };

  const handlePrintResume = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const htmlContent = renderTemplateHTML(selectedTemplate, resumeData);
    const cssContent = getTemplateCSS(selectedTemplate);

    doc.open();
    doc.write(`
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          <div class="no-print" style="padding: 10px; background: #eff6ff; text-align: center; font-family: sans-serif; font-size: 10pt; color: #1d4ed8; font-weight: bold; border-bottom: 1px solid #bfdbfe;">
            PlaceTrack Live PDF Export
          </div>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.parent.document.body.removeChild(window.frameElement);
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const parsedSkills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name, phone, dob, gender, address,
      cgpa: parseFloat(cgpa) || 0,
      tenthPercentage: parseFloat(tenth) || 0,
      twelfthPercentage: parseFloat(twelfth) || 0,
      activeBacklogs: parseInt(backlogs) || 0,
      department, degree, batch,
      skills: parsedSkills
    };

    try {
      const { data } = await api.put(`/students/${profile._id}`, payload);
      if (data.success) {
        setProfile(data.student);
        setAlert({ type: 'success', msg: 'Profile details saved successfully.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setAlert(null);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const { data } = await api.post('/students/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setProfile((prev) => ({ ...prev, photo: data.photo }));
        setAlert({ type: 'success', msg: 'Profile picture updated successfully.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to upload photo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setLoading(true);
    setAlert(null);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const { data } = await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setProfile((prev) => ({ ...prev, resume: data.resume }));
        setResumeFile(null);
        setAlert({ type: 'success', msg: 'Resume PDF uploaded successfully.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Resume upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!documentFile) return;

    setLoading(true);
    setAlert(null);
    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('name', docName);

    try {
      const { data } = await api.post('/students/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setProfile((prev) => ({ ...prev, documents: data.documents }));
        setDocumentFile(null);
        setAlert({ type: 'success', msg: `${docName} submitted for verification.` });
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Document upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 font-display">Manage Profile</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Update qualifications and verifications status</p>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'
        }`}>
          {alert.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-3 flex flex-col gap-1 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          {[
            { id: 'personal', label: 'Personal Information', icon: <User size={16} /> },
            { id: 'academic', label: 'Academic Standing', icon: <GraduationCap size={16} /> },
            { id: 'skills', label: 'Skills & Development', icon: <Briefcase size={16} /> },
            { id: 'resume', label: 'Resume management', icon: <FileCheck size={16} /> },
            { id: 'resume-builder', label: 'ATS Resume Builder', icon: <Sparkles size={16} className="text-violet-500" /> },
            { id: 'documents', label: 'Document verification', icon: <FileCheck size={16} /> },
            { id: 'settings', label: 'Account Settings', icon: <Settings size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setAlert(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-md shadow-blue-500/10'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="lg:col-span-9 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6">
            
            {activeTab === 'personal' && (
              <div className="flex flex-col gap-5 animate-page-enter">
                <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Personal Information</h3>
                
                {/* Profile Photo Upload Segment */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 mb-2">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg font-display relative overflow-hidden shrink-0">
                    {profile?.photo ? (
                      <img src={getUploadUrl(profile.photo)} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
                    <span className="font-bold text-slate-700">Profile Display Image</span>
                    <p className="text-[10px] text-slate-400">Supports PNG, JPG, or JPEG format (max 5MB).</p>
                    <div className="flex items-center gap-3 mt-1 justify-center sm:justify-start">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="px-4 py-2 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 cursor-pointer active:scale-95 transition-all text-[11px] text-slate-600 shadow-sm"
                      >
                        Choose Photo
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  <Select
                    label="Gender"
                    options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <Input label="Residential Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>
                <Button variant="primary" type="submit" className="w-fit self-end mt-4 px-6" disabled={loading}>
                  Save Details
                </Button>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="flex flex-col gap-5 animate-page-enter">
                <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Academic Standing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Degree Course"
                    options={[
                      { value: 'B.Tech', label: 'B.Tech' },
                      { value: 'MCA', label: 'MCA' },
                      { value: 'MBA', label: 'MBA' }
                    ]}
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                  <Select
                    label="Department"
                    options={[
                      { value: 'CSE', label: 'Computer Science (CSE)' },
                      { value: 'IT', label: 'Information Technology (IT)' },
                      { value: 'ECE', label: 'Electronics (ECE)' }
                    ]}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                  <Input label="Graduation Year Batch" placeholder="e.g. 2022-2026" value={batch} onChange={(e) => setBatch(e.target.value)} />
                  <Input label="Current Cumulative CGPA" type="number" step="0.01" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required />
                  <Input label="10th High School Percentage" type="number" step="0.1" value={tenth} onChange={(e) => setTenth(e.target.value)} />
                  <Input label="12th Senior Secondary Percentage" type="number" step="0.1" value={twelfth} onChange={(e) => setTwelfth(e.target.value)} />
                  <Input label="Active Semester Backlogs" type="number" value={backlogs} onChange={(e) => setBacklogs(e.target.value)} />
                </div>
                <Button variant="primary" type="submit" className="w-fit self-end mt-4 px-6" disabled={loading}>
                  Save Academic Standing
                </Button>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="flex flex-col gap-5 animate-page-enter">
                <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Skills & Development</h3>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Key Skills (Comma separated)"
                    placeholder="React, Java, SQL, Python"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillsText.split(',').map((s) => s.trim()).filter(Boolean).map((s, idx) => (
                      <Badge key={idx} status="primary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="primary" type="submit" className="w-fit self-end mt-4 px-6" disabled={loading}>
                  Save Skills
                </Button>
              </div>
            )}
          </form>

          {activeTab === 'resume' && (
            <div className="flex flex-col gap-6 animate-page-enter">
              <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Resume Management</h3>
              
              {profile?.resume?.fileUrl ? (
                <div className="flex flex-col gap-4">
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 font-display">{profile.resume.fileName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Uploaded on: {new Date(profile.resume.uploadDate).toLocaleDateString()} • Version: v{profile.resume.version}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={handleAnalyzeResume} disabled={analyzingAts} className="gap-1 text-xs">
                        <Sparkles size={14} className="text-violet-500" />
                        {analyzingAts ? 'Calculating ATS...' : 'Run ATS Evaluation'}
                      </Button>
                      <a
                        href={getUploadUrl(profile.resume.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-500 hover:text-primary-500 hover:bg-white rounded-lg transition-colors border border-slate-100 shadow-sm"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>

                  {/* ATS Results Breakdown Box */}
                  {atsAnalysis && (
                    <div className="p-5 border border-violet-100 bg-violet-50/20 rounded-2xl flex flex-col gap-4 text-xs">
                      <div className="flex items-center justify-between border-b border-violet-100/60 pb-3">
                        <span className="font-bold text-slate-800 font-display flex items-center gap-2">
                          <Sparkles size={16} className="text-violet-500" />
                          ATS Evaluation Score Card
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Real-time PDF Scan</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-center">
                          <span className={`text-2xl font-black font-display ${
                            (atsAnalysis.atsScore ?? atsAnalysis.score) >= 80 ? 'text-emerald-600' :
                            (atsAnalysis.atsScore ?? atsAnalysis.score) >= 60 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {atsAnalysis.atsScore ?? atsAnalysis.score}%
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">ATS Match Score</p>
                        </div>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-center">
                          <span className="text-2xl font-black text-slate-800 font-display">{atsAnalysis.formattingScore || 85}%</span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Formatting Score</p>
                        </div>
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-center col-span-2 sm:col-span-1">
                          <span className="text-2xl font-black text-slate-800 font-display">{atsAnalysis.score}%</span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Overall Profile Score</p>
                        </div>
                      </div>

                      {atsAnalysis.feedback && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100">
                          "{atsAnalysis.feedback}"
                        </p>
                      )}

                      {atsAnalysis.detectedSkills && atsAnalysis.detectedSkills.length > 0 && (
                        <div>
                          <p className="font-bold text-slate-700 mb-1.5 font-display">Detected Tech Keywords</p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsAnalysis.detectedSkills.map((sk, idx) => (
                              <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {atsAnalysis.missingSkills && atsAnalysis.missingSkills.length > 0 && (
                        <div>
                          <p className="font-bold text-slate-700 mb-1.5 font-display">Recommended Tech to Add</p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsAnalysis.missingSkills.map((sk, idx) => (
                              <span key={idx} className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-md border border-rose-100">
                                + {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {atsAnalysis.suggestions && atsAnalysis.suggestions.length > 0 && (
                        <div>
                          <p className="font-bold text-slate-700 mb-1.5 font-display">Key Recommendations</p>
                          <ul className="flex flex-col gap-1.5 text-slate-500">
                            {atsAnalysis.suggestions.map((s, idx) => (
                              <li key={idx} className="flex gap-2 items-start">
                                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center gap-3">
                  <AlertCircle size={24} className="text-slate-400" />
                  <p className="text-xs text-slate-500 font-semibold">No resume uploaded yet. Recruiter drives require an active resume PDF.</p>
                </div>
              )}

              <form onSubmit={handleResumeUpload} className="mt-4 flex flex-col gap-4">
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-display">Upload New Resume (PDF format, max 5MB)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <Button variant="primary" type="submit" className="w-fit self-end px-6 gap-2" disabled={loading || !resumeFile}>
                  <Upload size={14} /> Upload Resume
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'resume-builder' && (
            <div className="flex flex-col gap-6 animate-page-enter text-xs text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">ATS-Friendly Resume Builder</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Fill details and export Overleaf styled PDF templates</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    options={[
                      { value: 'classic', label: 'LaTeX Classic (Serif Academic)' },
                      { value: 'modern', label: 'Modern Tech (Sans-Serif)' },
                      { value: 'two-column', label: 'Executive Two-Column' }
                    ]}
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  />
                  <Button variant="primary" onClick={handlePrintResume} className="bg-emerald-500 hover:bg-emerald-600 border-none gap-1.5 shadow-none py-2 shrink-0">
                    <Printer size={13} /> Print/Save PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form Controls Column */}
                <div className="lg:col-span-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-2">
                  
                  {/* Contact Block */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                    <span className="font-bold text-slate-700">Contact & Social Links</span>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Name" value={resumeData.name} onChange={(e) => setResumeData({...resumeData, name: e.target.value})} />
                      <Input label="Email" type="email" value={resumeData.email} onChange={(e) => setResumeData({...resumeData, email: e.target.value})} />
                      <Input label="Phone" value={resumeData.phone} onChange={(e) => setResumeData({...resumeData, phone: e.target.value})} />
                      <Input label="Location" value={resumeData.location} onChange={(e) => setResumeData({...resumeData, location: e.target.value})} />
                      <Input label="GitHub Link" value={resumeData.github} onChange={(e) => setResumeData({...resumeData, github: e.target.value})} />
                      <Input label="LinkedIn Link" value={resumeData.linkedin} onChange={(e) => setResumeData({...resumeData, linkedin: e.target.value})} />
                      <div className="col-span-2">
                        <Input label="Portfolio / Leetcode Link" value={resumeData.portfolio} onChange={(e) => setResumeData({...resumeData, portfolio: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                    <span className="font-bold text-slate-700">Professional Summary</span>
                    <textarea
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-primary-500 font-sans"
                      rows="4"
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                    />
                  </div>

                  {/* Education List */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Education Records</span>
                      <button onClick={addEducation} className="p-1 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded flex items-center gap-0.5 font-bold cursor-pointer">
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 bg-white rounded-xl flex flex-col gap-3 relative">
                        <button onClick={() => removeEducation(idx)} className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 font-bold">×</button>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Input label="Degree / Course" value={edu.degree} onChange={(e) => {
                            const list = [...resumeData.education];
                            list[idx].degree = e.target.value;
                            setResumeData({...resumeData, education: list});
                          }} />
                          <Input label="Graduation Year" value={edu.year} onChange={(e) => {
                            const list = [...resumeData.education];
                            list[idx].year = e.target.value;
                            setResumeData({...resumeData, education: list});
                          }} />
                          <Input label="Institution" value={edu.institution} onChange={(e) => {
                            const list = [...resumeData.education];
                            list[idx].institution = e.target.value;
                            setResumeData({...resumeData, education: list});
                          }} />
                          <Input label="GPA / Percentage" value={edu.gpa} onChange={(e) => {
                            const list = [...resumeData.education];
                            list[idx].gpa = e.target.value;
                            setResumeData({...resumeData, education: list});
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Experience List */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Experience / Internships</span>
                      <button onClick={addExperience} className="p-1 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded flex items-center gap-0.5 font-bold cursor-pointer">
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 bg-white rounded-xl flex flex-col gap-3 relative">
                        <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 font-bold">×</button>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Input label="Company Name" value={exp.company} onChange={(e) => {
                            const list = [...resumeData.experience];
                            list[idx].company = e.target.value;
                            setResumeData({...resumeData, experience: list});
                          }} />
                          <Input label="Duration (e.g. Jun-Aug 2025)" value={exp.duration} onChange={(e) => {
                            const list = [...resumeData.experience];
                            list[idx].duration = e.target.value;
                            setResumeData({...resumeData, experience: list});
                          }} />
                          <div className="col-span-2">
                            <Input label="Role Title" value={exp.role} onChange={(e) => {
                              const list = [...resumeData.experience];
                              list[idx].role = e.target.value;
                              setResumeData({...resumeData, experience: list});
                            }} />
                          </div>
                          <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Bullet description (One per line)</label>
                            <textarea
                              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                              rows="3"
                              value={exp.description}
                              onChange={(e) => {
                                const list = [...resumeData.experience];
                                list[idx].description = e.target.value;
                                setResumeData({...resumeData, experience: list});
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Projects List */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Projects</span>
                      <button onClick={addProject} className="p-1 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded flex items-center gap-0.5 font-bold cursor-pointer">
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {resumeData.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 bg-white rounded-xl flex flex-col gap-3 relative">
                        <button onClick={() => removeProject(idx)} className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 font-bold">×</button>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Input label="Project Title" value={proj.title} onChange={(e) => {
                            const list = [...resumeData.projects];
                            list[idx].title = e.target.value;
                            setResumeData({...resumeData, projects: list});
                          }} />
                          <Input label="Tech Stack (e.g. React, SQL)" value={proj.technologies} onChange={(e) => {
                            const list = [...resumeData.projects];
                            list[idx].technologies = e.target.value;
                            setResumeData({...resumeData, projects: list});
                          }} />
                          <div className="col-span-2">
                            <Input label="Project Repo URL Link" value={proj.link} onChange={(e) => {
                              const list = [...resumeData.projects];
                              list[idx].link = e.target.value;
                              setResumeData({...resumeData, projects: list});
                            }} />
                          </div>
                          <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Bullet description (One per line)</label>
                            <textarea
                              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                              rows="3"
                              value={proj.description}
                              onChange={(e) => {
                                const list = [...resumeData.projects];
                                list[idx].description = e.target.value;
                                setResumeData({...resumeData, projects: list});
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills Block */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                    <span className="font-bold text-slate-700">Skills (Comma-separated)</span>
                    <Input
                      placeholder="React, Java, SQL, Python"
                      value={resumeData.skills.join(', ')}
                      onChange={(e) => setResumeData({...resumeData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    />
                  </div>

                  {/* Certifications List */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Certifications</span>
                      <button onClick={addCertification} className="p-1 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded flex items-center gap-0.5 font-bold cursor-pointer">
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {resumeData.certifications.map((cert, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 bg-white rounded-xl flex flex-col gap-2 relative">
                        <button onClick={() => removeCertification(idx)} className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 font-bold">×</button>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Input label="Certification Name" value={cert.name} onChange={(e) => {
                            const list = [...resumeData.certifications];
                            list[idx].name = e.target.value;
                            setResumeData({...resumeData, certifications: list});
                          }} />
                          <Input label="Authority / Issuer" value={cert.authority} onChange={(e) => {
                            const list = [...resumeData.certifications];
                            list[idx].authority = e.target.value;
                            setResumeData({...resumeData, certifications: list});
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Achievements List */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Achievements</span>
                      <button onClick={addAchievement} className="p-1 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded flex items-center gap-0.5 font-bold cursor-pointer">
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {resumeData.achievements.map((ach, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 bg-white rounded-xl flex flex-col gap-2 relative">
                        <button onClick={() => removeAchievement(idx)} className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 font-bold">×</button>
                        <div className="mt-1">
                          <Input label="Achievement description" value={ach.description} onChange={(e) => {
                            const list = [...resumeData.achievements];
                            list[idx].description = e.target.value;
                            setResumeData({...resumeData, achievements: list});
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* PDF Live Mock Preview Column */}
                <div className="lg:col-span-6 flex flex-col gap-3 h-full">
                  <div className="p-3 bg-blue-50/50 border border-blue-100 text-[10px] rounded-xl text-blue-700 leading-normal">
                    ⚠️ <strong>How to activate resume:</strong> After clicking <strong>Print/Save PDF</strong>, select <strong>Save as PDF</strong> as the printer destination in your browser. Then, upload this file inside the <strong>Resume Management</strong> tab to apply for corporate drives!
                  </div>
                  <div className="border border-slate-200 bg-slate-100/50 p-4 rounded-xl shadow-xs max-h-[70vh] overflow-y-auto flex justify-center">
                    <div className="bg-white p-6 shadow-md w-full border border-slate-200 max-w-[21cm] min-h-[29.7cm] flex flex-col gap-1 print-preview text-slate-800">
                      <style>
                        {getTemplateCSS(selectedTemplate)}
                      </style>
                      <div dangerouslySetInnerHTML={{ __html: renderTemplateHTML(selectedTemplate, resumeData) }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="flex flex-col gap-6 animate-page-enter">
              <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Document Verification</h3>
              
              {/* Document Lists Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-xs text-left align-middle">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-3.5 whitespace-nowrap">Document Name</th>
                      <th className="px-6 py-3.5 whitespace-nowrap">Status</th>
                      <th className="px-6 py-3.5 whitespace-nowrap">Remarks</th>
                      <th className="px-6 py-3.5 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {profile?.documents?.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-6 text-center text-slate-400">No documents submitted yet.</td>
                      </tr>
                    ) : (
                      profile?.documents?.map((doc) => (
                        <tr key={doc._id}>
                          <td className="px-6 py-3.5 font-semibold text-slate-800">{doc.name}</td>
                          <td className="px-6 py-3.5">
                            <Badge
                              status={
                                doc.status === 'VERIFIED' ? 'success' :
                                doc.status === 'REJECTED' ? 'danger' : 'warning'
                              }
                            >
                              {doc.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-3.5 text-slate-500 italic">{doc.remarks || '--'}</td>
                          <td className="px-6 py-3.5 text-right">
                            <a
                              href={getUploadUrl(doc.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 font-bold"
                            >
                              View <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Upload Document Form */}
              <form onSubmit={handleDocumentUpload} className="mt-6 border-t border-slate-50 pt-6 flex flex-col gap-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Submit Certificate for Verification</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Certificate Type"
                    options={[
                      { value: '10th Certificate', label: '10th Certificate' },
                      { value: '12th Certificate', label: '12th Certificate' },
                      { value: 'Degree Certificate', label: 'Degree Certificate' },
                      { value: 'Internship Certificate', label: 'Internship Certificate' }
                    ]}
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                  />
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 font-display">Choose PDF Document</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setDocumentFile(e.target.files[0])}
                      className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <Button variant="primary" type="submit" className="w-fit self-end px-6 gap-2" disabled={loading || !documentFile}>
                  <Upload size={14} /> Submit Certificate
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 animate-page-enter">
              <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Account Settings</h3>
              
              {/* Account details section */}
              <div className="p-5 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3 text-xs text-left">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] font-display">System Profile Coordinates</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-semibold block">Email Address</span>
                    <span className="font-bold text-slate-800">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">System Role</span>
                    <Badge status="primary">STUDENT</Badge>
                  </div>
                </div>
              </div>

              {/* Theme Settings block */}
              <div className="p-5 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between text-xs text-left mt-2">
                <div>
                  <p className="font-bold text-slate-700 font-display">Interface Theme Preference</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Toggle between light and dark modes</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-600 shadow-sm"
                >
                  {theme === 'light' ? (
                    <><Moon size={14} className="text-violet-500" /> Dark Mode</>
                  ) : (
                    <><Sun size={14} className="text-amber-500" /> Light Mode</>
                  )}
                </button>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handlePasswordChange} className="mt-6 border-t border-slate-100 pt-6 flex flex-col gap-4 text-xs text-left">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] font-display">Update Password Credentials</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                <Button variant="primary" type="submit" className="w-fit self-end px-6 gap-2" disabled={loading}>
                  Save Password Settings
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
