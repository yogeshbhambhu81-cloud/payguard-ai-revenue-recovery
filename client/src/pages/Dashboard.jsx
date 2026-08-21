import React, { useState } from 'react';
import { IndianRupee, Percent, AlertOctagon, TrendingDown, RefreshCcw } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { StatCard } from '../components/StatCard';
import { AIInsightCard } from '../components/AIInsightCard';
import { RevenueChart } from '../components/RevenueChart';
import { FailureChart } from '../components/FailureChart';
import { PaymentTable } from '../components/PaymentTable';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';
import { RecoveryModal } from '../components/RecoveryModal';
import { formatCurrency } from '../utils/formatCurrency';

export const Dashboard = ({ onOpenCopilot }) => {
  const { overview, failedPayments, trends, refreshData } = usePayments();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [recoveryPayment, setRecoveryPayment] = useState(null);

  // Exact metrics required in prompt Section 13
  const revenueToday = overview?.totalRevenueToday || 842000;
  const successRate = overview?.paymentSuccessRate || 91.2;
  const failedCount = overview?.failedCount || 87;
  const revenueAtRisk = overview?.revenueAtRisk || 72400;
  const potentiallyRecoverable = overview?.potentiallyRecoverable || 38000;

  return (
    <div className="space-y-6">
      {/* Top AI Insight Section */}
      <AIInsightCard
        overview={overview}
        onStartRecovery={() => {
          if (failedPayments && failedPayments.length > 0) {
            setRecoveryPayment(failedPayments[0]);
          }
        }}
      />

      {/* Top Metrics Row - Exact Section 13 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Revenue Today"
          value={formatCurrency(revenueToday)}
          subtitle="Captured transactions"
          icon={IndianRupee}
          color="green"
        />

        <StatCard
          title="Payment Success Rate"
          value={`${successRate}%`}
          subtitle="Overall conversion"
          icon={Percent}
          color="blue"
        />

        <StatCard
          title="Failed Payments"
          value={failedCount}
          subtitle="Requires attention"
          icon={AlertOctagon}
          color="red"
        />

        <StatCard
          title="Revenue At Risk"
          value={formatCurrency(revenueAtRisk)}
          subtitle="Lost transaction value"
          icon={TrendingDown}
          color="amber"
          highlight={true}
        />

        <StatCard
          title="Potentially Recoverable"
          value={formatCurrency(potentiallyRecoverable)}
          subtitle="Estimated AI recovery"
          icon={RefreshCcw}
          color="purple"
          highlight={true}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={trends} />
        <FailureChart data={trends} />
      </div>

      {/* Failed Payments Table */}
      <PaymentTable
        payments={failedPayments}
        onSelectPayment={(payment) => setSelectedPayment(payment)}
        onRecoverPayment={(payment) => setRecoveryPayment(payment)}
      />

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onGenerateLink={(payment) => setRecoveryPayment(payment)}
        />
      )}

      {/* Recovery Payment Modal */}
      {recoveryPayment && (
        <RecoveryModal
          payment={recoveryPayment}
          onClose={() => setRecoveryPayment(null)}
          onRecoverySuccess={() => refreshData()}
        />
      )}
    </div>
  );
};
