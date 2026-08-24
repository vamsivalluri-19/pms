import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import { Button, LoadingSpinner, EmptyState } from '../../components/UI.jsx';
import {
  ClipboardList,
  CheckCircle,
  Calendar,
  Briefcase,
  Bot,
  Sparkles,
  FileCheck,
  Send,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const StudentDashboard = () => {
  const { profile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);

  // AI Chatbot State
  const [showChat, setShowChat] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // AI Resume Analyzer State
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/stats/student');
      if (data.success) {
        setStats(data.stats);
        setApplications(data.applicationsList);
        setDrives(data.upcomingDrives);

        // If placed (Selected), trigger celebration confetti!
        if (data.stats.selectedCount > 0) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // AI Chatbot queries
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMsg = { sender: 'USER', content: chatQuery };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatQuery('');
    setChatLoading(true);

    try {
      const { data } = await api.post('/ai/chatbot', { query: userMsg.content });
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: 'AI', content: data.reply }]);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'AI', content: 'Apologies, I encountered an issue accessing my knowledge base. Try again shortly.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Run AI Resume Analyzer
  const handleAnalyzeResume = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.get('/ai/resume-analyzer');
      if (data.success) {
        setResumeAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };



  // Helper for quick assistant prompt shortcuts
  const sendQuickPrompt = async (promptText) => {
    const userMsg = { sender: 'USER', content: promptText };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);
    try {
      const { data } = await api.post('/ai/chatbot', { query: promptText });
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: 'AI', content: data.reply }]);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'AI', content: 'Apologies, I encountered an issue. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Placement celebration banner */}
      {stats?.selectedCount > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight font-display">Congratulations! You are selected! 🎉</h2>
            <p className="mt-1 text-xs text-emerald-100 font-semibold">Your corporate placement record is active. Check offers in the Placements tab.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 text-white font-extrabold text-sm uppercase">Placed</div>
        </div>
      )}

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Applications Sent" value={stats?.totalApplications || 0} icon={<ClipboardList size={22} />} variant="blue" />
        <StatCard title="In Selection Progress" value={stats?.inProgressCount || 0} icon={<Briefcase size={22} />} variant="indigo" />
        <StatCard title="Shortlisted Rounds" value={stats?.shortlistedCount || 0} icon={<FileCheck size={22} />} variant="violet" />
        <StatCard title="Job Offers Received" value={stats?.selectedCount || 0} icon={<CheckCircle size={22} />} variant="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recommended Drives & Recent applications */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Upcoming drives card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-800 font-display mb-4">Recommended Placement Drives</h3>
            {drives.length === 0 ? (
              <EmptyState title="No matching drives" message="Check details inside your Profile to ensure CGPA is updated." />
            ) : (
              <div className="flex flex-col gap-4">
                {drives.map((d) => (
                  <div key={d._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500 text-white font-extrabold flex items-center justify-center text-sm font-display uppercase">
                        {d.company?.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{d.job?.title}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase">{d.company?.name} • {d.job?.ctc} LPA</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span>Deadline: {new Date(d.registrationEnd).toLocaleDateString()}</span>
                      <Button variant="primary" size="sm" onClick={() => window.location.href = `/student/drives`}>
                        Verify & Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Application timelines */}
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-800 font-display mb-4">Recent Applications Status</h3>
            {applications.length === 0 ? (
              <EmptyState title="No active applications" message="Browse active drives to apply for matching positions." />
            ) : (
              <div className="flex flex-col gap-4">
                {applications.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs font-display">
                        {app.company?.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{app.job?.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{app.company?.name}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      app.status === 'Selected' ? 'bg-emerald-50 text-emerald-600' :
                      app.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Resume Analyzer panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[40px] pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-violet-500" />
              <h3 className="text-sm font-bold text-slate-800 font-display">AI Resume Analyzer</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify your resume parses correctly. Our engine evaluates formatting, ATS scores, and highlights missing skills.
            </p>

            {resumeAnalysis ? (
              <div className="mt-5 flex flex-col gap-4">
                {profile?.resume?.fileName && (
                  <p className="text-[10px] bg-slate-50 text-slate-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                    Active Resume: {profile.resume.fileName}
                  </p>
                )}

                <div className="flex items-center justify-around py-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-center">
                    <span className={`text-3xl font-black font-display ${
                      (resumeAnalysis.atsScore ?? resumeAnalysis.score) >= 80 ? 'text-emerald-600' :
                      (resumeAnalysis.atsScore ?? resumeAnalysis.score) >= 60 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {resumeAnalysis.atsScore ?? resumeAnalysis.score}%
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ATS Match</p>
                  </div>
                  <div className="h-9 border-r border-slate-200"></div>
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-800 font-display">{resumeAnalysis.formattingScore || 85}%</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Formatting</p>
                  </div>
                </div>

                {resumeAnalysis.feedback && (
                  <p className="text-[11px] text-slate-600 leading-relaxed italic bg-violet-50/50 p-3 rounded-xl border border-violet-100/60">
                    "{resumeAnalysis.feedback}"
                  </p>
                )}

                {resumeAnalysis.detectedSkills && resumeAnalysis.detectedSkills.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 mb-1.5 font-display">Detected Tech Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeAnalysis.detectedSkills.map((sk, idx) => (
                        <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resumeAnalysis.missingSkills && resumeAnalysis.missingSkills.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 mb-1.5 font-display">Missing Skills to Add</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeAnalysis.missingSkills.map((sk, idx) => (
                        <span key={idx} className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-md border border-rose-100">
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs">
                  <p className="font-bold text-slate-700 mb-2 font-display">Actionable Improvements</p>
                  <ul className="flex flex-col gap-2">
                    {resumeAnalysis.suggestions.slice(0, 3).map((s, idx) => (
                      <li key={idx} className="flex gap-2 text-slate-500 leading-normal text-[11px]">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="secondary" size="sm" onClick={handleAnalyzeResume} disabled={analyzing} className="mt-1">
                  {analyzing ? 'Recalculating...' : 'Re-Run ATS Evaluation'}
                </Button>
              </div>
            ) : !profile?.resume?.fileUrl ? (
              <div className="mt-6 flex flex-col gap-3">
                <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle size={14} /> No resume uploaded yet.
                </p>
                <p className="text-[11px] text-slate-400">
                  Please upload your resume in the Profile section to enable ATS scoring.
                </p>
                <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => window.location.href = '/student/profile'}>
                  Go to Profile to Upload
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-[11px] font-semibold text-slate-500">
                  Active file: <span className="text-primary-600">{profile.resume.fileName}</span>
                </p>
                <Button variant="primary" size="md" className="w-full" onClick={handleAnalyzeResume} disabled={analyzing}>
                  {analyzing ? 'Analyzing resume...' : 'Run ATS Evaluation'}
                </Button>
              </div>
            )}
          </div>

          {/* Quick AI Assistant Trigger Card */}
          <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl text-left relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-30%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[50px]"></div>
            <div className="flex items-center gap-2 mb-4">
              <Bot size={20} className="text-blue-400" />
              <h3 className="text-sm font-bold font-display">PlaceTrack AI Assistant</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Ask short questions on eligible drives, interview prep, application statuses, or resume improvements.
            </p>
            <Button variant="primary" className="w-full bg-blue-500 hover:bg-blue-600 border-none" onClick={() => setShowChat(true)}>
              Launch Chatbot Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Slide-out AI Chatbot Drawer Component */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={() => setShowChat(false)}></div>
          <div className="relative w-full sm:w-[450px] max-w-full h-full bg-white shadow-2xl flex flex-col z-10 animate-page-enter">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Bot size={20} className="text-blue-400" />
                <div>
                  <p className="text-sm font-bold font-display">PlaceTrack AI Assistant</p>
                  <p className="text-[10px] text-slate-400">Concise & Smart Advisor</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer">×</button>
            </div>

            {/* Quick Action Shortcut Pills */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { label: '⚡ Active Drives', query: 'What are my active placement drives?' },
                { label: '📝 ATS Resume Tips', query: 'Give me 3 quick ATS resume tips' },
                { label: '🎯 Mock Prep', query: 'Give me a mock interview question' },
                { label: '📊 Application Status', query: 'What is my application status?' }
              ].map((pill, idx) => (
                <button
                  key={idx}
                  disabled={chatLoading}
                  onClick={() => sendQuickPrompt(pill.query)}
                  className="px-3 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200 shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {chatMessages.length === 0 && (
                <div className="my-auto text-center flex flex-col items-center gap-3 py-6">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-500">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 font-display">How can I assist you today?</p>
                  <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
                    Click any shortcut pill above or type a query to get concise, instant answers.
                  </p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed break-words whitespace-pre-wrap ${
                    msg.sender === 'USER'
                      ? 'bg-primary-500 text-white rounded-br-none shadow-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-400 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat form query */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-100 flex gap-2 shrink-0 bg-white">
              <input
                type="text"
                placeholder="Type a quick message..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
