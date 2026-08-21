import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingState = ({ message = 'Loading PayGuard AI analytics...' }) => {
  return (
    <div className="py-20 text-center space-y-3">
      <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
      <p className="text-xs text-slate-300 font-medium">{message}</p>
    </div>
  );
};
