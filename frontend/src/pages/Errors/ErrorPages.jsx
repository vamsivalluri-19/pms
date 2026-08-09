import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI.jsx';
import { AlertCircle, FileX } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
      <FileX size={48} className="text-slate-400 mb-4 animate-pulse-slow" />
      <h1 className="text-3xl font-extrabold text-slate-800 font-display">Page Not Found</h1>
      <p className="mt-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">The requested workspace route does not exist.</p>
      <Button variant="primary" className="mt-8 px-6" onClick={() => navigate('/')}>
        Go to Homepage
      </Button>
    </div>
  );
};

export const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
      <AlertCircle size={48} className="text-rose-500 mb-4 animate-bounce" />
      <h1 className="text-3xl font-extrabold text-slate-800 font-display">Access Denied</h1>
      <p className="mt-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">Your account role does not have authorization parameters for this node.</p>
      <Button variant="primary" className="mt-8 px-6 bg-rose-500 hover:bg-rose-600 shadow-rose-500/10 border-none" onClick={() => navigate('/login')}>
        Sign In as Another Role
      </Button>
    </div>
  );
};
