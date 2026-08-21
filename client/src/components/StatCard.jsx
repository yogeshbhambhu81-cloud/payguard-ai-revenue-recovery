import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', highlight = false }) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  };

  return (
    <div className={`fintech-card p-5 fintech-card-hover ${highlight ? 'border-indigo-500/40 bg-indigo-950/20' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <div className="mt-1 text-xs text-slate-400">{subtitle}</div>}
      </div>
    </div>
  );
};
