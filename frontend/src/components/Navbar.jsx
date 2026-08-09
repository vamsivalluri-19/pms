import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { GraduationCap, Menu, X, LayoutDashboard } from 'lucide-react';
import { Button } from './UI.jsx';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Drives', href: '#drives' },
    { name: 'Success Stories', href: '#success' },
    { name: 'FAQ', href: '#faq' }
  ];

  const handleScrollTo = (id) => {
    setIsOpen(false);
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id.replace('#', ''));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    const role = user.role.toLowerCase();
    if (role === 'placement_manager') return '/manager/dashboard';
    return `/${role}/dashboard`;
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md border-b border-slate-100 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-md shadow-blue-500/20">
            <GraduationCap size={24} />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-800 font-display tracking-tight leading-none block">PlaceTrack</span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Campus Placements</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleScrollTo(link.href)}
              className="text-sm font-semibold text-slate-600 hover:text-primary-500 transition-colors cursor-pointer"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Button variant="primary" onClick={() => navigate(getDashboardPath())} className="flex gap-2">
              <LayoutDashboard size={16} />
              Dashboard
            </Button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-bold text-slate-700 hover:text-primary-500 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <Button variant="primary" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-700 hover:text-primary-500 p-2 cursor-pointer"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 p-6 flex flex-col gap-5 animate-pulse-slow">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleScrollTo(link.href)}
              className="text-left text-sm font-semibold text-slate-700 hover:text-primary-500 transition-colors py-2 border-b border-slate-50"
            >
              {link.name}
            </button>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <Button variant="primary" onClick={() => navigate(getDashboardPath())}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
