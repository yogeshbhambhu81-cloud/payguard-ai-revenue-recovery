import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const EmptyState = ({ title = 'No Data Available', message = 'No payment records found matching your filter.' }) => {
  return (
    <div className="fintech-card p-12 text-center space-y-3">
      <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">{message}</p>
    </div>
  );
};
