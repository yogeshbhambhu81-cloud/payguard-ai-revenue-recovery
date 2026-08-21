import React from 'react';
import { RiskBadge } from './RiskBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { ArrowUpRight, Eye } from 'lucide-react';

export const PaymentTable = ({ payments, onSelectPayment, onRecoverPayment }) => {
  return (
    <div className="fintech-card overflow-hidden">
      <div className="p-4 px-5 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Failed Payment Recoveries</h3>
          <p className="text-xs text-slate-400">Transactions eligible for automated Razorpay Payment Link recovery</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-bold border border-slate-700/60 shadow-sm">
          {payments?.length || 0} Target Transactions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0B101A] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5 font-bold">
            <tr>
              <th className="px-5 py-3.5">Payment ID</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5">Method</th>
              <th className="px-5 py-3.5">Failure Reason</th>
              <th className="px-5 py-3.5">Recovery AI Score</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {payments && payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-5 py-4 font-mono font-medium text-indigo-400 group-hover:text-indigo-300">
                    {p.paymentId || 'pay_test_001'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-200">{p.customer?.name || 'Customer'}</div>
                    <div className="text-[11px] text-slate-400">{p.customer?.email || ''}</div>
                  </td>
                  <td className="px-5 py-4 font-extrabold text-white text-sm">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-5 py-4 uppercase font-semibold text-slate-400">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/80 text-[10px] text-slate-300 tracking-wider">
                      {p.method || 'CARD'}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate text-slate-300 text-xs font-normal">
                    {p.reason}
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge score={p.recoveryScore} label={p.recoveryLabel} />
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => onSelectPayment(p)}
                      className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/80 transition-all inline-flex items-center gap-1 hover:text-white"
                      title="View Details & AI Analysis"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRecoverPayment(p)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30"
                    >
                      <span>Recover</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  No failed payments matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
