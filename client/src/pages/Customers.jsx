import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { Users, RefreshCw } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/recovery');
      if (res.data?.success) {
        setCustomers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch customer analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Merchant Customer Recovery Profiles</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Tiered customer retry suitability scores calculated from historical transaction behavior</p>
        </div>

        <button
          onClick={fetchCustomers}
          className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="fintech-card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading customer recovery profiles...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No recoverable customer profiles found. Run seed script or make transactions to populate profile data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0F172A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232F45]">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Success / Total</th>
                  <th className="px-4 py-3">Failed Amount</th>
                  <th className="px-4 py-3">Recovery Score</th>
                  <th className="px-4 py-3">AI Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232F45]">
                {customers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#1A2436] transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{item.customer?.name || 'Customer'}</td>
                    <td className="px-4 py-3.5 text-slate-400">
                      <div>{item.customer?.email}</div>
                      <div className="text-[10px] text-slate-500">{item.customer?.phone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-emerald-400">{item.customer?.successfulPayments || 0}</span> / {item.customer?.totalPayments || 1} payments
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-white">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-3.5">
                      <RiskBadge score={item.recoveryScore || 85} label={item.recoveryLabel || (item.recoveryScore >= 80 ? 'HIGH' : 'MEDIUM')} />
                    </td>
                    <td className="px-4 py-3.5 text-indigo-300 max-w-xs truncate">{item.aiRecommendation || 'High likelihood of retry success via Razorpay link.'}</td>
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
