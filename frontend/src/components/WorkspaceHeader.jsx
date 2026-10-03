import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Landmark, ShieldCheck, Sparkles } from 'lucide-react';

const copy = {
  STUDENT: {
    eyebrow: 'Career command deck',
    title: 'Make every opportunity count.',
    description: 'Your tailored view of applications, readiness, and the path to your next offer.',
    icon: GraduationCap,
    tag: 'Candidate edition',
    tone: 'student'
  },
  COMPANY: {
    eyebrow: 'Talent acquisition studio',
    title: 'Build a remarkable hiring pipeline.',
    description: 'Create opportunities, assess high-potential candidates, and move faster with clarity.',
    icon: BriefcaseBusiness,
    tag: 'Recruiter edition',
    tone: 'company'
  },
  PLACEMENT_MANAGER: {
    eyebrow: 'Placement operations room',
    title: 'Turn campus momentum into outcomes.',
    description: 'Approve, coordinate, and guide every recruiting journey from one live operations view.',
    icon: Landmark,
    tag: 'Operations edition',
    tone: 'manager'
  },
  ADMIN: {
    eyebrow: 'Institutional control centre',
    title: 'Run the placement ecosystem.',
    description: 'Govern access, monitor activity, and keep every institutional signal in view.',
    icon: ShieldCheck,
    tag: 'Administrator edition',
    tone: 'admin'
  }
};

const formatPage = (path) => {
  const last = path.split('/').filter(Boolean).at(-1) || 'dashboard';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const WorkspaceHeader = () => {
  const { user, profile } = useContext(AuthContext);
  const location = useLocation();
  const meta = copy[user?.role] || copy.STUDENT;
  const Icon = meta.icon;
  const name = profile?.name?.split(' ')[0] || (user?.role === 'ADMIN' ? 'Administrator' : 'there');

  return (
    <motion.section
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl overflow-hidden mb-8 border border-slate-800"
    >
      {/* Background Ornaments */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between text-left">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-blue-300">
            <Sparkles size={13} className="text-blue-400 shrink-0" /> {meta.eyebrow}
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            {location.pathname.endsWith('/dashboard') ? `Welcome back, ${name}.` : formatPage(location.pathname)}
          </h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300">{meta.description}</p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold flex items-center gap-2 shadow-xs">
            <Icon size={15} className="text-blue-400 shrink-0" />
            <span>{meta.tag}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold flex items-center gap-1.5">
            <span>{formatPage(location.pathname)}</span>
            <ArrowUpRight size={14} className="shrink-0" />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default WorkspaceHeader;
