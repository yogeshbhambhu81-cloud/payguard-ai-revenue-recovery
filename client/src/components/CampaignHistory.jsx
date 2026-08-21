import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recovery-campaigns');
      if (res.data.success) {
        setCampaigns(res.data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to fetch campaign history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="fintech-card p-5 border border-slate-800 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">Recovery Campaign History</h3>
        </div>
        <button
          onClick={fetchCampaigns}
          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No recovery email campaigns created yet. Select a category and prepare a campaign to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-2.5">Category & Subject</th>
                <th className="p-2.5">Recipients</th>
                <th className="p-2.5">Sent / Failed</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {campaigns.map(c => (
                <tr key={c._id} className="hover:bg-slate-900/40">
                  <td className="p-2.5 font-medium">
                    <p className="text-slate-200 font-semibold">{c.emailSubject}</p>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      {c.failureCategory}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-slate-300">
                    {c.recipientCount} Customers
                  </td>
                  <td className="p-2.5">
                    <span className="text-emerald-400 font-semibold">{c.sentCount} Sent</span> / <span className="text-rose-400">{c.failedCount} Failed</span>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'SCHEDULED'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right text-slate-400 text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
