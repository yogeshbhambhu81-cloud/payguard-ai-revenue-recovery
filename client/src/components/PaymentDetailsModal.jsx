import React from 'react';
import { X, Sparkles, User, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { RiskBadge } from './RiskBadge';

export const PaymentDetailsModal = ({ payment, onClose, onGenerateLink }) => {
  if (!payment) return null;

  const cust = payment.customer || {};
  const score = payment.recoveryScore || 87;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151D2A] border border-[#232F45] rounded-xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#232F45] pb-4">
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Investigation</div>
            <h2 className="text-lg font-bold text-white font-mono">{payment.paymentId || 'pay_test_1001'}</h2>
          </div>
        </div>

        {/* Payment Summary Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 text-xs">
          <div className="bg-[#0F172A] p-3 rounded-lg border border-[#232F45]">
            <div className="text-slate-400 font-medium">Transaction Amount</div>
            <div className="text-base font-extrabold text-white mt-0.5">{formatCurrency(payment.amount)}</div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-lg border border-[#232F45]">
            <div className="text-slate-400 font-medium">Payment Method</div>
            <div className="text-sm font-bold text-indigo-400 uppercase mt-0.5">{payment.method}</div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-lg border border-[#232F45]">
            <div className="text-slate-400 font-medium">Customer Name</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{cust.name || 'Rahul Sharma'}</div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-lg border border-[#232F45]">
            <div className="text-slate-400 font-medium">Failure Reason</div>
            <div className="text-xs font-semibold text-red-400 mt-0.5">{payment.reason || 'UPI PSP Server Timeout'}</div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Behavioral Reasoning</span>
            </div>
            <RiskBadge score={score} />
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-[#0F172A]/80 p-3 rounded-lg border border-[#232F45]">
            "Customer has successfully completed {cust.successfulPayments || 8} previous payments with an average transaction value of {formatCurrency(cust.averageTransactionAmount || 1950)}. This failed payment is consistent with historical behavior. The current failure appears temporary rather than customer-driven."
          </p>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">AI Confidence: <strong className="text-emerald-400">87%</strong></span>
            <span className="text-slate-400">Recommendation: <strong className="text-indigo-300">Generate Razorpay Link</strong></span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#232F45]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onGenerateLink(payment);
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/30"
          >
            Generate Recovery Link
          </button>
        </div>
      </div>
    </div>
  );
};
