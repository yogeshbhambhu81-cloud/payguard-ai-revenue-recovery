import React, { useState, useEffect } from 'react';
import { getPayments } from '../services/paymentApi';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { CreditCard, Search } from 'lucide-react';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [search]);

  const fetchPayments = async () => {
    try {
      const res = await getPayments({ search, limit: 50 });
      if (res.success) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">All Payment Transactions</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Full transaction ledger of successful and failed Razorpay payments</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Payment ID or Email..."
            className="bg-[#151D2A] border border-[#232F45] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      <div className="fintech-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0F172A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232F45]">
              <tr>
                <th className="px-4 py-3">Razorpay Payment ID</th>
                <th className="px-4 py-3">Customer Email</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232F45]">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-[#1A2436] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-medium text-indigo-400">{p.razorpayPaymentId}</td>
                  <td className="px-4 py-3.5 text-slate-200">{p.email || p.customerId?.email || 'N/A'}</td>
                  <td className="px-4 py-3.5 font-bold text-white">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3.5 uppercase text-slate-400 font-medium">{p.method}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      p.status === 'captured' || p.status === 'authorized'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
