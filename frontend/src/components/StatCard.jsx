import React from 'react';

const StatCard = ({ title, value, icon, description, trend, variant = 'blue' }) => {
  const borderVariants = {
    blue: 'border-l-4 border-l-blue-500',
    indigo: 'border-l-4 border-l-indigo-500',
    violet: 'border-l-4 border-l-violet-500',
    emerald: 'border-l-4 border-l-emerald-500',
    amber: 'border-l-4 border-l-amber-500',
    rose: 'border-l-4 border-l-rose-500'
  };

  const iconVariants = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600'
  };

  return (
    <div className={`premium-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-between ${borderVariants[variant]}`}>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-800 font-display tracking-tight">{value}</p>
        {(description || trend) && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {trend && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {trend}
              </span>
            )}
            {description && <span className="text-[11px] text-slate-500">{description}</span>}
          </div>
        )}
      </div>
      <div className={`p-4 rounded-2xl flex items-center justify-center ${iconVariants[variant]}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
