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
      transition={{ duration: .48, ease: [0.22, 1, 0.36, 1] }}
      className={`workspace-hero workspace-hero-${meta.tone}`}
    >
      <div className="workspace-hero-orb workspace-hero-orb-one" />
      <div className="workspace-hero-orb workspace-hero-orb-two" />
      <div className="workspace-hero-grid" />
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-white/65">
            <Sparkles size={13} /> {meta.eyebrow}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-[-.04em] text-white sm:text-3xl font-display">
            {location.pathname.endsWith('/dashboard') ? `Welcome back, ${name}.` : formatPage(location.pathname)}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">{meta.description}</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="workspace-hero-tag"><Icon size={16} /><span>{meta.tag}</span></div>
          <div className="workspace-hero-page"><span>{formatPage(location.pathname)}</span><ArrowUpRight size={15} /></div>
        </div>
      </div>
    </motion.section>
  );
};

export default WorkspaceHeader;
