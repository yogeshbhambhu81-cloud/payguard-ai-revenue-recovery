import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export const AIInsightCard = ({ overview, onStartRecovery }) => {
  const navigate = useNavigate();

  const handleAnalyze = () => {
    navigate('/failure-analysis');
  };

  const atRisk = overview?.revenueAtRisk || 72400;
  const recoverable = overview?.potentiallyRecoverable || 38000;
  const highProbCount = overview?.highProbCustomersCount || 20;

  return (
    <div className="fintech-card p-6 border-indigo-500/40 bg-gradient-to-br from-[#1E1B4B]/40 via-[#151D2A] to-[#0F172A] relative overflow-hidden ai-pulse">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-48 h-48 text-indigo-400" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232F45] pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 mt-0.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                AI Revenue Intelligence
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              ⚠️ Revenue Drop & UPI Failure Anomaly Detected
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Payment success rate is 8.2% lower than the previous 7-day average. 47% of failed transactions occurred through UPI between 7 PM and 9 PM.
            </p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze with AI</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        <div className="p-3.5 bg-[#0F172A]/70 border border-[#232F45] rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Revenue At Risk</div>
          <div className="text-xl font-extrabold text-red-400 mt-1">{formatCurrency(atRisk)}</div>
        </div>

        <div className="p-3.5 bg-[#0F172A]/70 border border-[#232F45] rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Potentially Recoverable</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatCurrency(recoverable)}</div>
        </div>

        <div className="p-3.5 bg-[#0F172A]/70 border border-[#232F45] rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">High Retry Customers</div>
          <div className="text-xl font-extrabold text-indigo-400 mt-1">{highProbCount} Customers</div>
        </div>
      </div>

      {/* Recommendations & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Recommended Action:</strong> Prioritize retryable customers and generate Razorpay Payment Links.
          </span>
        </div>

        <button
          onClick={onStartRecovery}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/30 transition-all shrink-0"
        >
          <span>START RECOVERY</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
