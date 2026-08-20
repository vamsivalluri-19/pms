import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { Button } from '../components/UI.jsx';
import { motion } from 'framer-motion';
import api from '../services/api.js';
import {
  Users,
  Building,
  GraduationCap,
  Award,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Calendar,
  Briefcase,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import studentPlacementImg from '../assets/student_placement.png';

const Home = () => {
  const navigate = useNavigate();

  // Testimonials demo list
  const testimonials = [
    { name: 'Aditya Sen', role: 'Software Engineer, Microsoft', comment: 'PlaceTrack guided me from my first profile update to tracking each selection round. The eligibility engine kept me focused on drives matching my GPA.' },
    { name: 'Dr. Rajesh Kumar', role: 'Head of Corporate Relations, PlaceTrack Uni', comment: 'Managing 5,000+ candidates across dozens of recruiters became trivial. The automated selection progression and reports generation saved us months.' },
    { name: 'Julie Vance', role: 'Talent Acquisition, Amazon', comment: 'Setting up custom tests and scheduling interviews took minutes. Promoting passed students automatically into successive coding tests is a game-changer.' }
  ];

  // FAQ Accordion states
  const [faqs, setFaqs] = useState([
    { q: 'How do I apply for a placement drive?', a: 'Sign in as a student, update your academic details, view active drives on the board, verify your eligibility, and click Apply.', open: false },
    { q: 'How can I check my eligibility?', a: 'Our engine computes compatibility dynamically. If your CGPA, batch, or department does not match, the platform blocks registration and details the missing criteria.', open: false },
    { q: 'Can companies create their own drives?', a: 'Yes. Registered recruiters can create jobs and drives, set custom requirements, construct selection rounds dynamically, and evaluate candidates.', open: false },
    { q: 'How are recruitment rounds managed?', a: 'Recruiters create unlimited rounds (e.g., Coding Tests, Technical Interviews). When students are graded as Pass, they move automatically to the next round.', open: false }
  ]);

  const toggleFaq = (index) => {
    setFaqs(faqs.map((faq, i) => i === index ? { ...faq, open: !faq.open } : faq));
  };

  const [drivesList, setDrivesList] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [publicStats, setPublicStats] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const drivesRes = await api.get('/drives/public');
        if (drivesRes.data.success) {
          setDrivesList(drivesRes.data.drives);
        }
        const statsRes = await api.get('/stats/public');
        if (statsRes.data.success) {
          setPublicStats(statsRes.data.stats);
        }
      } catch (err) {
        console.error('Error loading public data:', err);
      } finally {
        setLoadingDrives(false);
      }
    };
    fetchPublicData();
  }, []);

  const totalStudentsVal = publicStats && publicStats.totalStudents > 0 ? `${publicStats.totalStudents}+` : 'Growing';
  const activeCompaniesVal = publicStats && publicStats.activeCompanies > 0 ? `${publicStats.activeCompanies}+` : 'Growing';
  const totalDrivesVal = publicStats && publicStats.totalDrives > 0 ? `${publicStats.totalDrives}+` : 'Active';
  const placedStudentsVal = publicStats && publicStats.placedStudents > 0 ? `${publicStats.placedStudents}+` : 'Rising';

  const highestPackageVal = publicStats && publicStats.highestPackage > 0 ? `${publicStats.highestPackage} LPA` : 'Competitive';
  const averagePackageVal = publicStats && publicStats.averagePackage > 0 ? `${publicStats.averagePackage} LPA` : 'Competitive';
  const placementRateVal = publicStats && publicStats.totalStudents > 0 ? `${((publicStats.placedStudents / publicStats.totalStudents) * 100).toFixed(1)}%` : 'Growing with every placement';

  return (
    <div className="public-shell min-h-screen relative overflow-hidden" id="home">
      <Navbar />

      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-violet-400/10 blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-40 lg:pt-48 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-600 mb-6"
          >
            <Sparkles size={14} className="animate-spin" />
            Empowering Campus Career Journeys
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-display"
          >
            Your Gateway to <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Career Opportunities</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base text-slate-600 leading-relaxed max-w-xl"
          >
            One powerful platform to discover placement opportunities, apply for jobs, track recruitment rounds, and manage your entire placement journey.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button variant="primary" size="lg" onClick={() => navigate('/register')} className="gap-2">
              Get Started <ChevronRight size={18} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => {
              const el = document.getElementById('drives');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Drives
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 relative"
        >
          <div className="relative rounded-3xl border border-slate-100 shadow-2xl p-2 bg-white/50 backdrop-blur-md overflow-hidden">
            <img src="https://www.chitkara.edu.in/blogs/wp-content/uploads/2022/05/MBA-Sales-and-Marketing.jpeg" alt="PlaceTrack Student Placements" className="w-full h-auto rounded-2xl object-cover aspect-[4/3] shadow-sm" />
          </div>
        </motion.div>
      </section>

      {/* Counters Statistics */}
      <section className="bg-slate-900 text-white py-16" id="stats">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Registered Candidates', val: totalStudentsVal, icon: <Users size={24} className="text-blue-400 mx-auto mb-2" /> },
            { label: 'Active Recruiters', val: activeCompaniesVal, icon: <Building size={24} className="text-violet-400 mx-auto mb-2" /> },
            { label: 'Placement Drives', val: totalDrivesVal, icon: <GraduationCap size={24} className="text-emerald-400 mx-auto mb-2" /> },
            { label: 'Selected Candidates', val: placedStudentsVal, icon: <Award size={24} className="text-rose-400 mx-auto mb-2" /> }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              {stat.icon}
              <p className="text-3xl font-extrabold font-display">{stat.val}</p>
              <p className="mt-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24" id="features">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 font-display">A Unified Experience For All Roles</h2>
          <p className="mt-4 text-sm text-slate-500">Designed to bridge coordinates between candidates, recruiters, and the university coordinator board.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { role: 'For Students', title: 'Accelerate Your Hiring', list: ['Build a validated academic profile', 'Check drive eligibility instantly', 'Securely store resumes and credentials', 'Track application round timelines'], color: 'border-l-blue-500 text-blue-600 bg-blue-50/20' },
            { role: 'For Recruiters', title: 'Simplify Selection Tasks', list: ['Register company details and jobs', 'Construct recruitment events & drives', 'Create customizable dynamic rounds', 'Grade results and schedule interviews'], color: 'border-l-violet-500 text-violet-600 bg-violet-50/20' },
            { role: 'For Managers & Admins', title: 'Orchestrate Operations', list: ['Verify student records and documents', 'Authorize companies & placement drives', 'Analyze college-wide dashboard metrics', 'Audit administrative records & logs'], color: 'border-l-emerald-500 text-emerald-600 bg-emerald-50/20' }
          ].map((item, idx) => (
            <div key={idx} className={`p-8 bg-white border-t border-slate-100 rounded-2xl shadow-xs border-l-4 ${item.color.split(' ')[0]}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${item.color.split(' ').slice(1).join(' ')}`}>
                {item.role}
              </span>
              <h3 className="text-lg font-bold text-slate-800 font-display mt-6">{item.title}</h3>
              <ul className="mt-6 flex flex-col gap-3">
                {item.list.map((li, lIdx) => (
                  <li key={lIdx} className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-100/50 py-24 border-y border-slate-100" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 font-display">Four Easy Steps</h2>
            <p className="mt-4 text-sm text-slate-500">Your roadmap from campus profile setup to landing final offers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Complete Profile', desc: 'Add academic records, high school marks, active backlogs, and professional skills.' },
              { num: '02', title: 'Explore Drives', desc: 'Search matching drives and evaluate eligibility dynamically.' },
              { num: '03', title: 'Attend Rounds', desc: 'Attempt coding tests, review scorecards, and check virtual interview schedules.' },
              { num: '04', title: 'Get Placed', desc: 'Unlock your official selection records and securely accept offer letters.' }
            ].map((step, sIdx) => (
              <div key={sIdx} className="p-6 bg-white border border-slate-100 rounded-2xl text-left relative group hover:shadow-lg transition-all duration-300">
                <span className="text-4xl font-black text-slate-100 font-display absolute top-4 right-4 group-hover:text-primary-500/10 transition-colors">
                  {step.num}
                </span>
                <h3 className="text-base font-bold text-slate-800 font-display mt-4">{step.title}</h3>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drives Directory Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-24" id="drives">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-slate-900 font-display">Active Campus Placement Drives</h2>
            <p className="mt-2 text-sm text-slate-500">Check current registration limits and company packages.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/login')} className="mt-4 sm:mt-0">
            View All Drives
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loadingDrives ? (
            <div className="col-span-3 text-center py-8 text-xs text-slate-400 font-semibold animate-pulse">Loading active campus drives...</div>
          ) : drivesList.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-xs text-slate-400 font-semibold">No active public registration drives today. Check back later!</div>
          ) : (
            drivesList.map((d, dIdx) => (
              <div key={d._id || dIdx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-extrabold text-sm font-display uppercase">
                    {(d.company?.name || d.name)[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display">{d.job?.title || d.name}</h3>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">{d.company?.name || 'Recruiter'}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-500 border-t border-b border-slate-50 py-4">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-slate-400" /> Package</span>
                    <span className="font-bold text-slate-800">{d.job?.ctc || 6.0} LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> Location</span>
                    <span className="font-semibold text-slate-700">{d.job?.location || 'Bengaluru'} ({d.job?.jobType || 'Onsite'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> Application Deadline</span>
                    <span className="font-semibold text-rose-500">{d.registrationDeadline ? new Date(d.registrationDeadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><Award size={14} className="text-slate-400" /> Eligibility</span>
                    <span className="font-semibold text-slate-700">CGPA &gt;= {d.eligibilityCriteria?.minCgpa || 6.0}, {d.eligibilityCriteria?.maxBacklogs || 0} Backlogs</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Direct Selection Rounds
                  </span>
                  <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                    Apply Now
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Success Metrics Placement Success */}
      <section className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white py-24" id="success">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 text-left">
            <h2 className="text-3xl font-bold tracking-tight font-display">Placement Excellence In Numbers</h2>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed">Our college metrics reflect our commitment towards training students and onboarding Tier-1 corporate partners.</p>
            <div className="mt-10 flex flex-col gap-6">
              {[
                { label: 'Highest Salary Package', val: highestPackageVal, bar: publicStats && publicStats.highestPackage > 0 ? 'w-[95%] bg-blue-500' : 'w-[10%] bg-blue-500' },
                { label: 'Average Salary Package', val: averagePackageVal, bar: publicStats && publicStats.averagePackage > 0 ? 'w-[70%] bg-violet-500' : 'w-[10%] bg-violet-500' },
                { label: 'Placement Performance', val: placementRateVal, bar: publicStats && publicStats.totalStudents > 0 ? 'w-[90%] bg-emerald-500' : 'w-[10%] bg-emerald-500' }
              ].map((m, mIdx) => (
                <div key={mIdx}>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>{m.label}</span>
                    <span className="font-bold">{m.val}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${m.bar}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t, tIdx) => (
              <div key={tIdx} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left flex flex-col justify-between">
                <p className="text-xs text-slate-300 italic leading-relaxed">"{t.comment}"</p>
                <div className="mt-6">
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Administrator Section */}
      <section className="bg-slate-900 text-white py-16 border-t border-b border-slate-800 relative overflow-hidden" id="admin-details">
        <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6 relative z-10">
          <div className="p-3 bg-white/5 border border-white/10 rounded-full text-primary-400 mb-2">
            <GraduationCap size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">Placement Operations Administrator</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Have questions regarding drive configurations, eligibility computations, or recruiter authorization audits? Reach out directly to our coordinator desk.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl text-left">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Administrator</span>
              <span className="text-sm font-bold text-white">Vamsi Valluri</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Number</span>
              <span className="text-sm font-bold text-white">+91 6301231575</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Email</span>
              <span className="text-sm font-bold text-white break-all">vamsivalluri52@gmail.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Accordion FAQs */}
      <section className="max-w-4xl mx-auto px-6 py-24" id="faq">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 font-display">Frequently Asked Questions</h2>
          <p className="mt-4 text-sm text-slate-500">Find answers to commonly asked questions about campus placement drives.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, fIdx) => (
            <div key={fIdx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button
                onClick={() => toggleFaq(fIdx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-slate-800 font-display text-sm cursor-pointer hover:bg-slate-50"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${faq.open ? 'rotate-180 text-primary-500' : ''}`} />
              </button>
              {faq.open && (
                <div className="px-6 pb-5 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-left">
          {/* Logo Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-primary-600">
                <GraduationCap size={16} />
              </div>
              <span className="font-bold font-display text-sm">PlaceTrack</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed max-w-xs">
              A comprehensive campus placement management platform built to orchestrate, simplify, and track student recruitment drives.
            </p>
          </div>

          {/* Contact Details Column */}
          <div className="flex flex-col gap-2.5">
            <span className="text-white font-bold font-display text-xs uppercase tracking-wider">Contact & Support</span>
            <p className="text-slate-300"><strong>Coordinator:</strong> Vamsi Valluri</p>
            <p className="text-slate-300"><strong>Phone:</strong> +91 6301231575</p>
            <p className="text-slate-300"><strong>Email:</strong> <a href="mailto:vamsivalluri52@gmail.com" className="text-primary-400 hover:underline">vamsivalluri52@gmail.com</a></p>
            <p className="text-slate-500 text-[10px] leading-normal">
              University Relations Office,<br />
              Kandipadu, Guntur (Dt), Andhra Pradesh
            </p>
          </div>

          {/* Copyright & Links Column */}
          <div className="flex flex-col md:items-end gap-3 text-slate-500">
            <p>© 2026 PlaceTrack. All rights reserved.</p>
            <div className="flex gap-4 font-semibold text-[11px]">
              <button
                onClick={() => setShowPrivacy(true)}
                className="hover:text-white cursor-pointer bg-transparent border-none p-0 font-semibold text-slate-500 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowTerms(true)}
                className="hover:text-white cursor-pointer bg-transparent border-none p-0 font-semibold text-slate-500 hover:text-white transition-colors"
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-page-enter">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary-600 text-white">
                  <CheckCircle2 size={16} />
                </div>
                <span className="font-bold font-display text-sm text-slate-800">PlaceTrack Privacy Policy</span>
              </div>
              <button
                onClick={() => setShowPrivacy(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer font-display"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4 text-left overflow-y-auto max-h-[60vh] text-xs text-slate-600 leading-relaxed pr-2">
              <div>
                <h4 className="font-bold text-slate-800 text-[13px] mb-1">1. Information Collection & Storage</h4>
                <p>We collect and archive student records including name, student ID, CGPA, department, phone, email, high school grade certificates, document verification receipts, and upload files (resumes, photos) necessary to evaluate career eligibility.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-[13px] mb-1">2. Core Processing Scope</h4>
                <p>All recorded academic credentials are processed exclusively to run criteria matching evaluations against recruiting company parameters, generate QR-authenticated candidate admission passes, and display college statistics dashboards.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-[13px] mb-1">3. Corporate Partner Transparency</h4>
                <p>By registering and applying for drives, students explicitly authorize recruiters corresponding to those specific drives to inspect their resumes, verified academic metrics, and interview scorecard round details.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-[13px] mb-1">4. Secure Auditing Logs</h4>
                <p>Administrative actions such as document verification check marks, placement drive updates, audit events, and user credential verification logs are maintained in automated audit trails to ensure complete transparency.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={() => setShowPrivacy(false)} className="px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-page-enter">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary-600 text-white">
                  <CheckCircle2 size={16} />
                </div>
                <span className="font-bold font-display text-sm text-slate-800">PlaceTrack Terms & Conditions</span>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer font-display"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4 text-left overflow-y-auto max-h-[60vh] text-xs text-slate-600 leading-relaxed pr-2">
              <div>
                <h4 className="font-bold text-slate-800 text-[13px] mb-1">1. Academic Data Integrity</h4>
                <p>Candidates must guarantee complete authenticity of their registered academic marks, CGPA stats, active backlog counts, and degree majors. Misrepresentation of high school or university scores constitutes structural misconduct and is subject to immediate suspension.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-[13px] mb-1">2. Drive Application Controls</h4>
                <p>Submitting an application binds the candidate to recruiter-specific requirements. Placement cell hall tickets remain locked until verified by the Director and released through the bulk generator desk.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-[13px] mb-1">3. Professional Conduct Policy</h4>
                <p>All candidates must act with decorum during assessment rounds, coding exams, and virtual interview room sessions. Malpractice, plagiarism, or unexcused absences will be automatically reported to the disciplinary committee.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-[13px] mb-1">4. Management Desks Rights</h4>
                <p>The placement coordinator cell retains absolute authority to inspect candidate documents, invalidate inaccurate resume assertions, update round selection grading, and lock access keys in the event of administrative infractions.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={() => setShowTerms(false)} className="px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
