import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const ScheduledRecoveryPanel = () => {
  const [scheduledItems, setScheduledItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduled = async () => {
    setLoading(true);
    try {
      const res = await api.get('/scheduled-recoveries');
      if (res.data.success) {
        setScheduledItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch scheduled recoveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
    const interval = setInterval(fetchScheduled, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id) => {
    try {
      const res = await api.patch(`/scheduled-recoveries/${id}/cancel`);
      if (res.data.success) {
        fetchScheduled();
      }
    } catch (err) {
      console.error('Failed to cancel scheduled task:', err);
    }
  };

  return (
    <div className="fintech-card p-5 border border-slate-800 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Scheduled Recovery Queue</h3>
            <p className="text-[11px] text-slate-400">Background poller executes due jobs automatically (polling every 15s)</p>
          </div>
        </div>
        <button
          onClick={fetchScheduled}
          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {scheduledItems.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No active or pending scheduled recovery jobs in the queue.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-2.5">Customer</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Scheduled For</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {scheduledItems.map(item => (
                <tr key={item._id} className="hover:bg-slate-900/40">
                  <td className="p-2.5 font-medium">
                    <p className="text-slate-200">{item.customerId?.name || 'Customer'}</p>
                    <p className="text-[10px] text-slate-400">{item.customerId?.email}</p>
                  </td>
                  <td className="p-2.5">
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-indigo-300 border border-slate-800 font-mono">
                      {item.failureCategory}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-300">
                    {new Date(item.scheduledFor).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.status === 'PROCESSING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : item.status === 'CANCELLED'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    {item.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(item._id)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold flex items-center gap-1 ml-auto"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
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
