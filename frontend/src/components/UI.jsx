import React from 'react';

// Modern Premium Button
export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer active:scale-[.98] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0';
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-blue-500/20 focus:ring-2 focus:ring-primary-500/30',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-2 focus:ring-slate-100',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/15 focus:ring-2 focus:ring-rose-500/30',
    ghost: 'text-slate-600 hover:bg-slate-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input Field
export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-600 font-display">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder-slate-400 text-slate-800 ${
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/5' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </div>
  );
};

// Custom Select Dropdown
export const Select = ({ label, options = [], error, className = '', ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-600 font-display">{label}</label>}
      <select
        className={`w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-800 ${
          error ? 'border-rose-400 focus:border-rose-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </div>
  );
};

// Premium Badges
export const Badge = ({ children, status = 'default', className = '' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    primary: 'bg-blue-50 text-blue-700 border-blue-100'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 ${styles[status]} ${className}`}>
      {children}
    </span>
  );
};

// Loading Spinner
export const LoadingSpinner = () => (
  <div className="w-full h-40 flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-3 border-slate-200 border-t-primary-500 animate-spin"></div>
  </div>
);

// Empty State View
export const EmptyState = ({ title = 'No Data Found', message = 'There are no items matching this criteria right now.' }) => (
  <div className="premium-card w-full py-12 px-6 flex flex-col items-center justify-center text-center rounded-2xl">
    <p className="text-base font-bold text-slate-800 font-display">{title}</p>
    <p className="mt-1 text-sm text-slate-500 max-w-sm">{message}</p>
  </div>
);
