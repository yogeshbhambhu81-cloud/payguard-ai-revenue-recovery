import React, { useState, useEffect } from 'react';
import { getFailedPayments } from '../services/paymentApi';
import { PaymentTable } from '../components/PaymentTable';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';
import { RecoveryModal } from '../components/RecoveryModal';
import { AlertTriangle, Filter, Sparkles } from 'lucide-react';

export const FailedPayments = () => {
  const [failures, setFailures] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [recoveryPayment, setRecoveryPayment] = useState(null);

  useEffect(() => {
    fetchFailures();
  }, [filterCategory, filterRisk]);

  const fetchFailures = async () => {
    try {
      const params = {};
      if (filterCategory !== 'ALL') params.category = filterCategory;
      if (filterRisk !== 'ALL') params.riskLevel = filterRisk;

      const res = await getFailedPayments(params);
      if (res.success) {
        setFailures(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch failed payments:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Payment Failures & Recovery Target List</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Segmented list of failed transactions categorized by failure type and AI recovery score
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Categories</option>
              <option value="UPI_FAILURE" className="bg-slate-900 text-slate-200">UPI Failure</option>
              <option value="BANK_FAILURE" className="bg-slate-900 text-slate-200">Bank Failure</option>
              <option value="INSUFFICIENT_FUNDS" className="bg-slate-900 text-slate-200">Insufficient Funds</option>
              <option value="AUTHENTICATION_FAILURE" className="bg-slate-900 text-slate-200">Auth Failure</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-medium">Probability:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Tiers</option>
              <option value="HIGH" className="bg-slate-900 text-slate-200">High Recovery</option>
              <option value="MEDIUM" className="bg-slate-900 text-slate-200">Medium Recovery</option>
              <option value="LOW" className="bg-slate-900 text-slate-200">Low Recovery</option>
            </select>
          </div>
        </div>
      </div>

      <PaymentTable
        payments={failures}
        onSelectPayment={(p) => setSelectedPayment(p)}
        onRecoverPayment={(p) => setRecoveryPayment(p)}
      />

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onGenerateLink={(p) => setRecoveryPayment(p)}
        />
      )}

      {recoveryPayment && (
        <RecoveryModal
          payment={recoveryPayment}
          onClose={() => setRecoveryPayment(null)}
          onRecoverySuccess={() => fetchFailures()}
        />
      )}
    </div>
  );
};
