import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { GraduationCap, Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Button } from './UI.jsx';

const Navbar = () => {
  const { user, theme, toggleTheme } = useContext(AuthContext);
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
    const targetId = id.replace('#', '');
    if (!targetId || targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const headerOffset = 85;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
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
      isScrolled
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-slate-200 dark:border-slate-800 py-3'
        : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 py-4 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-md shadow-blue-500/20">
            <GraduationCap size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-none">PlaceTrack</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold tracking-wider uppercase mt-1">Campus Placements</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleScrollTo(link.href)}
              className="text-sm font-bold text-slate-700 dark:text-slate-100 hover:text-primary-600 dark:hover:text-blue-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Auth Buttons & Theme Toggle */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-700 dark:text-slate-100 hover:text-primary-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <Button variant="primary" onClick={() => navigate(getDashboardPath())} className="flex items-center gap-2">
              <LayoutDashboard size={16} />
              Dashboard
            </Button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-bold text-slate-800 dark:text-white hover:text-primary-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
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
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 p-2 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 shadow-xl border-t border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4 animate-page-enter">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleScrollTo(link.href)}
              className="text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2 border-b border-slate-50 dark:border-slate-800"
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
