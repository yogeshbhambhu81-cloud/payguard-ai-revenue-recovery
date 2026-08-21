import React, { useState, useEffect } from 'react';
import { getRecoveryActions } from '../services/recoveryApi';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { ArrowUpRight, CheckCircle2, Link as LinkIcon, ExternalLink, Calendar, Filter, RefreshCw } from 'lucide-react';

export const Recovery = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('ALL_TIME'); // 'TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'ALL_TIME'

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await getRecoveryActions();
      if (res.success) {
        setActions(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching recovery actions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter actions based on selected time period
  const filterByPeriod = (actionList, period) => {
    if (period === 'ALL_TIME') return actionList;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return actionList.filter(act => {
      const actDate = new Date(act.createdAt || act.completedAt);
      if (period === 'TODAY') {
        return actDate >= todayStart;
      }
      if (period === 'LAST_7_DAYS') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return actDate >= sevenDaysAgo;
      }
      if (period === 'LAST_30_DAYS') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return actDate >= thirtyDaysAgo;
      }
      return true;
    });
  };

  const filteredActions = filterByPeriod(actions, timePeriod);

  const totalRecoveredAllTime = actions
    .filter(a => a.status === 'SUCCESSFUL' || a.status === 'PAID')
    .reduce((acc, a) => acc + (a.actualRecovery || a.estimatedRecovery || 0), 0);

  const periodRecovered = filteredActions
    .filter(a => a.status === 'SUCCESSFUL' || a.status === 'PAID')
    .reduce((acc, a) => acc + (a.actualRecovery || a.estimatedRecovery || 0), 0);

  const successfulCount = filteredActions.filter(a => a.status === 'SUCCESSFUL' || a.status === 'PAID').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Time Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Razorpay Recovery Campaigns</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Generated Razorpay Payment Links, time-bucketed analytics, and webhook recovery logs</p>
        </div>

        {/* Time Period Dropdown Selector */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-indigo-400 ml-2" />
            <select
              value={timePeriod}
              onChange={e => setTimePeriod(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-semibold px-2 py-1.5 outline-none cursor-pointer"
            >
              <option value="ALL_TIME" className="bg-slate-900 text-slate-200">All Time History</option>
              <option value="TODAY" className="bg-slate-900 text-slate-200">Today (Last 24 Hours)</option>
              <option value="LAST_7_DAYS" className="bg-slate-900 text-slate-200">Last 7 Days</option>
              <option value="LAST_30_DAYS" className="bg-slate-900 text-slate-200">Last 30 Days</option>
            </select>
          </div>

          <button
            onClick={fetchActions}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Recovered Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fintech-card p-4 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {timePeriod === 'ALL_TIME' ? 'Total Recovered (All Time)' : `Recovered (${timePeriod.replace(/_/g, ' ')})`}
              </div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatCurrency(periodRecovered)}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {successfulCount} successful payment links collected in selected timeframe
          </p>
        </div>

        <div className="fintech-card p-4 border-indigo-500/30 bg-slate-900">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total All-Time Recovered</div>
          <div className="text-xl font-extrabold text-indigo-400 mt-1">{formatCurrency(totalRecoveredAllTime)}</div>
          <p className="text-[10px] text-slate-400 mt-2">Cumulative revenue saved by PayGuard AI</p>
        </div>

        <div className="fintech-card p-4 border-slate-800 bg-slate-900">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active Recovery Actions</div>
          <div className="text-xl font-extrabold text-slate-200 mt-1">{filteredActions.length} Actions</div>
          <p className="text-[10px] text-slate-400 mt-2">Showing data for {timePeriod.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Recovery Actions Table */}
      <div className="fintech-card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Fetching recovery actions for selected time period...</span>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No recovery actions found for the selected time period ({timePeriod.replace(/_/g, ' ')}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0F172A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232F45]">
                <tr>
                  <th className="px-4 py-3">Reference ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Razorpay Link URL</th>
                  <th className="px-4 py-3">Estimated</th>
                  <th className="px-4 py-3">Actual Recovered</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232F45]">
                {filteredActions.map((act) => (
                  <tr key={act._id} className="hover:bg-[#1A2436] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-indigo-400">{act.referenceId || act._id}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{act.customerId?.name || 'Customer'}</td>
                    <td className="px-4 py-3.5 font-mono text-xs">
                      {act.paymentLinkUrl ? (
                        <a href={act.paymentLinkUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">
                          <span>{act.paymentLinkUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">Generating...</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-300">{formatCurrency(act.estimatedRecovery)}</td>
                    <td className="px-4 py-3.5 font-extrabold text-emerald-400">{formatCurrency(act.actualRecovery)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        act.status === 'SUCCESSFUL' || act.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{formatDate(act.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
