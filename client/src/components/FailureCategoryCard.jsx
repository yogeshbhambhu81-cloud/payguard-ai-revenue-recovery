import React from 'react';
import { AlertTriangle, Users, TrendingUp, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const CATEGORY_TITLES = {
  MERCHANT_SIDE: 'MERCHANT-SIDE ISSUES',
  CUSTOMER_SIDE: 'CUSTOMER-SIDE ISSUES',
  BANK_OR_UPI: 'BANK / UPI ISSUES',
  PAYMENT_METHOD: 'PAYMENT METHOD ISSUES',
  AUTHENTICATION: 'AUTHENTICATION FAILURES',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT FUNDS',
  NETWORK_OR_TIMEOUT: 'NETWORK / TIMEOUTS',
  PAYMENT_ABANDONED: 'PAYMENT ABANDONED',
  UNKNOWN: 'UNSPECIFIED FAILURES'
};

const CATEGORY_COLORS = {
  MERCHANT_SIDE: 'border-red-500/30 hover:border-red-500/60 bg-red-950/10',
  CUSTOMER_SIDE: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-950/10',
  BANK_OR_UPI: 'border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-950/10',
  PAYMENT_METHOD: 'border-purple-500/30 hover:border-purple-500/60 bg-purple-950/10',
  AUTHENTICATION: 'border-blue-500/30 hover:border-blue-500/60 bg-blue-950/10',
  INSUFFICIENT_FUNDS: 'border-slate-600/30 hover:border-slate-500/60 bg-slate-900/30',
  NETWORK_OR_TIMEOUT: 'border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-950/10',
  PAYMENT_ABANDONED: 'border-orange-500/30 hover:border-orange-500/60 bg-orange-950/10',
  UNKNOWN: 'border-slate-700 bg-slate-900/40'
};

export const FailureCategoryCard = ({ categoryData, isSelected, onClick }) => {
  const {
    category,
    totalFailedPayments,
    affectedCustomers,
    revenueAtRisk,
    potentiallyRecoverable,
    averageRecoveryScore,
    recommendedAction
  } = categoryData;

  const title = CATEGORY_TITLES[category] || category;
  const colorClass = CATEGORY_COLORS[category] || 'border-slate-700 bg-slate-900/40';

  return (
    <div
      onClick={onClick}
      className={`fintech-card p-5 cursor-pointer transition-all duration-200 border relative overflow-hidden ${colorClass} ${
        isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Category</span>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            {title}
          </h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            averageRecoveryScore >= 80
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : averageRecoveryScore >= 50
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}
        >
          {averageRecoveryScore}% Avg Score
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-slate-800/80 text-xs">
        <div>
          <p className="text-slate-400 font-medium">Failed Payments</p>
          <p className="text-sm font-bold text-slate-200 mt-0.5">{totalFailedPayments} Payments</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium">Affected Customers</p>
          <p className="text-sm font-bold text-slate-200 mt-0.5">{affectedCustomers} Customers</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium">Revenue At Risk</p>
          <p className="text-sm font-bold text-rose-400 mt-0.5">₹{(revenueAtRisk || 0).toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium">Potentially Recoverable</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{(potentiallyRecoverable || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/60">
          <span className="text-indigo-400 font-semibold block mb-0.5">Recommended Action:</span>
          <p className="text-slate-300 line-clamp-2">{recommendedAction}</p>
        </div>

        <button className="w-full py-2 px-3 rounded text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-colors">
          View Affected Customers
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
