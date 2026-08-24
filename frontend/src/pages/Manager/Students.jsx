import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api, { getUploadUrl } from '../../services/api.js';
import { Button, Input, Select, Badge, LoadingSpinner, EmptyState } from '../../components/UI.jsx';
import { Search, FileCheck, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

const ManagerStudents = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState('verification'); // verification, tracking
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/manager/applications') {
      setActiveView('tracking');
    } else {
      setActiveView('verification');
    }
  }, [location]);

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modal Verification States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('VERIFIED');
  const [remarks, setRemarks] = useState('');

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications');
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeView === 'tracking') {
      fetchApplications();
    } else {
      fetchStudents();
    }
  }, [activeView]);

  const openVerifyModal = (student, doc) => {
    setSelectedStudent(student);
    setSelectedDoc(doc);
    setVerificationStatus('VERIFIED');
    setRemarks('');
    setShowVerifyModal(true);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedDoc) return;

    const payload = {
      documentId: selectedDoc._id,
      status: verificationStatus,
      remarks
    };

    try {
      const { data } = await api.put(`/students/${selectedStudent._id}/documents/verify`, payload);
      if (data.success) {
        setShowVerifyModal(false);
        fetchStudents();
        alert(`Document verification status updated to ${verificationStatus}`);
      }
    } catch (err) {
      alert('Verification submission failed.');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter ? s.department === deptFilter : true;
    return matchesSearch && matchesDept;
  });



  const filteredApps = applications.filter((app) => {
    const studentName = app.student?.name || '';
    const studentId = app.student?.studentId || '';
    const companyName = app.company?.name || '';
    const jobTitle = app.job?.title || '';
    
    const matchesSearch = 
      studentName.toLowerCase().includes(search.toLowerCase()) || 
      studentId.toLowerCase().includes(search.toLowerCase()) || 
      companyName.toLowerCase().includes(search.toLowerCase()) || 
      jobTitle.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter ? app.student?.department === deptFilter : true;
    return matchesSearch && matchesDept;
  });



  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      {activeView === 'verification' ? (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-slate-800 font-display">Student Document Verification</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Audit candidate transcripts, high school sheets, and internship papers</p>
          </div>

          {/* Search and Filters */}
          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-4 text-xs">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search student name or ID..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-52">
              <Select
                options={[
                  { value: '', label: 'All Departments' },
                  { value: 'CSE', label: 'Computer Science (CSE)' },
                  { value: 'IT', label: 'Information Technology (IT)' },
                  { value: 'ECE', label: 'Electronics (ECE)' }
                ]}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Grid of Student Cards listing documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStudents.length === 0 ? (
              <div className="md:col-span-2"><EmptyState title="No students found" message="Add student profiles or change query filters to browse." /></div>
            ) : (
              filteredStudents.map((stud) => (
                <div key={stud._id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow text-xs">
                  <div>
                    <div className="flex justify-between items-start border-b border-slate-50 pb-3 mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm font-display">{stud.name}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{stud.studentId} • {stud.department} • CGPA: {stud.cgpa}</p>
                      </div>
                      <Badge status="primary">{stud.degree}</Badge>
                    </div>

                    <div className="flex flex-col gap-3">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1 font-display">Uploaded Certificates</p>
                      {stud.documents.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No certificates submitted for verification.</p>
                      ) : (
                        stud.documents.map((doc) => (
                          <div key={doc._id} className="flex justify-between items-center p-3 border border-slate-50 rounded-xl bg-slate-50/50">
                            <span className="font-semibold text-slate-700">{doc.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge
                                status={
                                  doc.status === 'VERIFIED' ? 'success' :
                                  doc.status === 'REJECTED' ? 'danger' : 'warning'
                                }
                              >
                                {doc.status}
                              </Badge>
                              <a href={getUploadUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-primary-500 rounded-md">
                                <ExternalLink size={12} />
                              </a>
                              {doc.status === 'PENDING' && (
                                <button
                                  onClick={() => openVerifyModal(stud, doc)}
                                  className="px-2 py-1 bg-primary-500 text-white rounded-md text-[10px] font-bold cursor-pointer"
                                >
                                  Verify
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-slate-800 font-display">Student Applications Tracking</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Monitor live drive applications and candidate selection progress</p>
          </div>

          {/* Search and Filters */}
          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-4 text-xs">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search candidate name, ID, or company..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-52">
              <Select
                options={[
                  { value: '', label: 'All Departments' },
                  { value: 'CSE', label: 'Computer Science (CSE)' },
                  { value: 'IT', label: 'Information Technology (IT)' },
                  { value: 'ECE', label: 'Electronics (ECE)' }
                ]}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Applications list table */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-x-auto shadow-xs">
            <div className="w-full">
              <table className="w-full text-xs text-left align-middle">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Student ID / Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Department / CGPA</th>
                    <th className="px-6 py-4 whitespace-nowrap">Applied Position</th>
                    <th className="px-6 py-4 whitespace-nowrap">Current Round</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        <EmptyState title="No applications tracked" message="Candidate registrations will show up here dynamically." />
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <div>
                            <p>{app.student?.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{app.student?.studentId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p>{app.student?.department}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">CGPA: {app.student?.cgpa}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-700">{app.job?.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{app.company?.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          Round {app.currentRound}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={app.status === 'Selected' ? 'success' : app.status === 'Rejected' ? 'danger' : 'primary'}>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400 font-semibold">
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Verification Modal Panel */}
      {showVerifyModal && selectedStudent && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-xs" onClick={() => setShowVerifyModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full z-10 text-xs animate-page-enter">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
              <FileCheck size={18} className="text-primary-500" />
              <h3 className="text-sm font-bold text-slate-800 font-display">Verify: {selectedDoc.name}</h3>
            </div>
            
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Student: {selectedStudent.name}</p>
            
            <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
              <Select
                label="Verification Decision"
                options={[
                  { value: 'VERIFIED', label: 'Approve & Verify' },
                  { value: 'REJECTED', label: 'Reject' }
                ]}
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
              />
              <Input
                label="Remarks / Rejection details"
                placeholder="e.g. Percentage doesn't match scorecard sheet."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <div className="flex gap-3 justify-end mt-4 border-t border-slate-50 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowVerifyModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Submit Decision</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerStudents;
//
