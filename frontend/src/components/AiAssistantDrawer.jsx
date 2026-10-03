import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { Bot, Sparkles, Send, X, ChevronRight } from 'lucide-react';

const AiAssistantDrawer = ({ isOpen, onClose }) => {
  const { user, profile } = useContext(AuthContext);
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const roleLabel = {
    STUDENT: 'Candidate Advisor',
    COMPANY: 'Recruiter Assistant',
    PLACEMENT_MANAGER: 'Coordinator Intelligence',
    ADMIN: 'System AI Specialist'
  }[user?.role] || 'Gemini AI Assistant';

  const rolePills = {
    STUDENT: [
      { label: '⚡ Active Drives', query: 'What active placement drives am I eligible for?' },
      { label: '💻 Mock Code Question', query: 'Give me a mock technical coding interview question with solution.' },
      { label: '📄 Resume ATS Tips', query: 'How can I increase my ATS resume score to 90%+' },
      { label: '🎯 Application Status', query: 'What is the status of my drive applications?' }
    ],
    COMPANY: [
      { label: '📝 Post Job Template', query: 'Give me an ideal Job Description template for Software Developer Intern.' },
      { label: '👥 Screening Advice', query: 'What are the top technical questions to screen MERN stack candidates?' }
    ],
    PLACEMENT_MANAGER: [
      { label: '📊 Placement Metrics', query: 'What is the current college placement rate and average CTC package?' },
      { label: '🎓 Drive Approval Check', query: 'What criteria should I verify before approving a corporate placement drive?' }
    ],
    ADMIN: [
      { label: '⚙️ User Accounts', query: 'How do I audit and manage user suspensions across roles?' },
      { label: '🏛️ Academic Settings', query: 'How can I register new departments, degrees, and student batches?' }
    ]
  }[user?.role] || [
    { label: '✨ Ask Gemini AI', query: 'How can you assist me on the PlaceTrack platform?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || chatQuery;
    if (!query.trim() || chatLoading) return;

    const userMsg = { sender: 'USER', content: query };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatQuery('');
    setChatLoading(true);

    try {
      const { data } = await api.post('/ai/chatbot', { query });
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: 'AI', content: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: 'AI', content: 'Apologies, I encountered an issue processing your query. Please try again.' }]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'AI', content: 'Apologies, I encountered a network error connecting to Gemini AI services.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Dark backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={onClose}></div>

      {/* Drawer Container - Full Height Screen */}
      <div className="relative w-full sm:w-[480px] max-w-full h-screen h-[100dvh] bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 animate-page-enter border-l border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-display text-white">PlaceTrack AI</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[9px] font-extrabold uppercase tracking-wider">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {roleLabel} {user && `• Logged in as ${profile?.name || user?.email?.split('@')[0]}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick shortcut pills */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {rolePills.map((pill, idx) => (
            <button
              key={idx}
              disabled={chatLoading}
              onClick={() => handleSendMessage(pill.query)}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white text-slate-800 dark:text-slate-100 rounded-full text-[11px] font-bold border border-slate-300 dark:border-slate-700 shrink-0 transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Message feed - Flex grow with overflow auto */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950">
          {chatMessages.length === 0 && (
            <div className="my-auto text-center flex flex-col items-center gap-4 py-8 px-4">
              <div className="p-4 rounded-3xl bg-blue-500/10 dark:bg-blue-500/20 text-primary-600 dark:text-blue-400 border border-blue-500/30 shadow-inner">
                <Sparkles size={34} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Welcome to PlaceTrack Gemini AI
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 max-w-[310px] leading-relaxed mt-1.5">
                  Ask me anything about tech skills, DSA coding problems, resume ATS optimization, mock interviews, drive eligibility, or platform navigation.
                </p>
              </div>
              <div className="w-full max-w-xs flex flex-col gap-2 mt-2">
                {rolePills.slice(0, 2).map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(pill.query)}
                    className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-primary-500 dark:hover:border-primary-500 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <span>{pill.label}</span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed break-words whitespace-pre-wrap ${
                msg.sender === 'USER'
                  ? 'bg-primary-600 text-white rounded-br-none shadow-md font-medium'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-800 shadow-sm font-normal'
              }`}>
                {msg.sender === 'AI' && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-600 dark:text-blue-400 mb-2 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                    <Bot size={13} /> PlaceTrack AI
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex gap-2 items-center border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1">Gemini AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Query Input form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2.5 shrink-0 bg-white dark:bg-slate-900">
          <input
            type="text"
            placeholder="Ask PlaceTrack AI anything..."
            className="flex-1 px-4 py-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-300 font-medium focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-colors shadow-inner"
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={chatLoading || !chatQuery.trim()}
            className="px-4 py-3 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantDrawer;
