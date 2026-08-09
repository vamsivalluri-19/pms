import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Button, Input, Select, Badge } from '../../components/UI.jsx';
import api from '../../services/api.js';
import {
  User,
  GraduationCap,
  Briefcase,
  FileCheck,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

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
    } else {
      setActiveTab('personal');
    }
  }, [location]);

  // Message alert state
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // File Upload states
  const [resumeFile, setResumeFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [docName, setDocName] = useState('10th Certificate');

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
            { id: 'documents', label: 'Document verification', icon: <FileCheck size={16} /> }
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
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 font-display">{profile.resume.fileName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Uploaded on: {new Date(profile.resume.uploadDate).toLocaleDateString()} • Version: v{profile.resume.version}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={profile.resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-500 hover:text-primary-500 hover:bg-white rounded-lg transition-colors border border-slate-100 shadow-sm"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center gap-3">
                  <AlertCircle size={24} className="text-slate-400 animate-pulse-slow" />
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

          {activeTab === 'documents' && (
            <div className="flex flex-col gap-6 animate-page-enter">
              <h3 className="text-sm font-bold text-slate-800 font-display mb-2">Document Verification</h3>
              
              {/* Document Lists Table */}
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5">Document Name</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Remarks</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
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
                              href={doc.fileUrl}
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
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
