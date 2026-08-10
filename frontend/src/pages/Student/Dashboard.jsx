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

  if (loading) return <LoadingSpinner />;

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
              <div className="mt-6 flex flex-col gap-5">
                <div className="flex items-center justify-around py-2">
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-800 font-display">{resumeAnalysis.score}</span>
                    <p className="text-[10px] text-slate-400 font-bold">ATS Score</p>
                  </div>
                  <div className="h-8 border-r border-slate-100"></div>
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-800 font-display">{resumeAnalysis.formattingScore}</span>
                    <p className="text-[10px] text-slate-400 font-bold">Formatting</p>
                  </div>
                </div>

                <div className="text-xs">
                  <p className="font-bold text-slate-700 mb-2">Recommendations</p>
                  <ul className="flex flex-col gap-2">
                    {resumeAnalysis.suggestions.slice(0, 2).map((s, idx) => (
                      <li key={idx} className="flex gap-2 text-slate-500 leading-normal">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="secondary" size="sm" onClick={handleAnalyzeResume} disabled={analyzing}>
                  {analyzing ? 'Recalculating...' : 'Re-Analyze Resume'}
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="md" className="w-full mt-6" onClick={handleAnalyzeResume} disabled={analyzing}>
                {analyzing ? 'Analyzing resume...' : 'Run ATS Evaluation'}
              </Button>
            )}
          </div>

          {/* Quick AI Assistant Trigger Bubble */}
          <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl text-left relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-30%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[50px]"></div>
            <div className="flex items-center gap-2 mb-4">
              <Bot size={20} className="text-blue-400" />
              <h3 className="text-sm font-bold font-display">PlaceTrack AI Assistant</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Ask questions regarding matching drives, application statuses, interview advice, or technical preparation tips.
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
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-page-enter">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Bot size={20} className="text-blue-400" />
                <div>
                  <p className="text-sm font-bold font-display">PlaceTrack AI Coordinator</p>
                  <p className="text-[10px] text-slate-400">Authenticated Student Chat</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white text-lg font-bold">×</button>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {chatMessages.length === 0 && (
                <div className="my-auto text-center flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-50 text-blue-500">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 font-display">Hi, I am your PlaceTrack AI Coordinator!</p>
                  <p className="text-[11px] text-slate-400 max-w-[220px]">Ask me: "Start Mock Practice", "Interview prep questions for my skills", or "Evaluate my resume against Microsoft job criteria"</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-700 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-400 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat form query */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-100 flex gap-3">
              <input
                type="text"
                placeholder="Ask assistant something..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
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
