import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { FailureCategoryCard } from '../components/FailureCategoryCard';
import { AffectedCustomersTable } from '../components/AffectedCustomersTable';
import { RecoveryCampaignModal } from '../components/RecoveryCampaignModal';
import { ScheduledRecoveryPanel } from '../components/ScheduledRecoveryPanel';
import { CampaignHistory } from '../components/CampaignHistory';
import { LoadingState } from '../components/LoadingState';
import api from '../services/api';

export const FailureAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('BANK_OR_UPI');
  const [categoryCustomers, setCategoryCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [activeModal, setActiveModal] = useState(false);
  const [selectedCustomerList, setSelectedCustomerList] = useState([]);
  const [successBanner, setSuccessBanner] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/overview');
      if (res.data.success) {
        setOverviewData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch failure analysis overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryCustomers = async (category) => {
    setLoadingCustomers(true);
    try {
      const res = await api.get(`/analysis/category/${category}/customers`);
      if (res.data.success) {
        setCategoryCustomers(res.data.customers || []);
      }
    } catch (err) {
      console.error('Failed to fetch category customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryCustomers(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handlePrepareCampaign = (customersToCampaign) => {
    setSelectedCustomerList(customersToCampaign);
    setActiveModal(true);
  };

  const handleCampaignSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 6000);
    fetchOverview();
    if (selectedCategory) fetchCategoryCustomers(selectedCategory);
  };

  if (loading) return <LoadingState message="Analyzing merchant failure patterns & revenue risk..." />;

  const aiIntelligence = overviewData?.aiIntelligence || {};
  const cards = overviewData?.categoryCards || [];
  const activeCard = cards.find(c => c.category === selectedCategory) || cards[0] || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Title & Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Failure Analysis & Recovery Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grouped failure intelligence, automated classification, and per-customer bulk recovery campaigns.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="py-2 px-4 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Analysis
        </button>
      </div>

      {successBanner && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-300 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="font-semibold">{successBanner}</p>
        </div>
      )}

      {/* AI FAILURE INTELLIGENCE BANNER */}
      <div className="fintech-card p-6 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">AI FAILURE INTELLIGENCE</span>
              {aiIntelligence.aiAvailable === false && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Rule-Based Analysis</span>
              )}
            </div>

            <p className="text-base font-bold text-slate-100">
              We analyzed {overviewData?.totalFailedPaymentsCount || 300} failed payments. ₹{(overviewData?.totalRevenueAtRisk || 0).toLocaleString('en-IN')} is currently at risk.
            </p>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {aiIntelligence.summary || `₹${(overviewData?.totalPotentiallyRecoverable || 0).toLocaleString('en-IN')} is potentially recoverable. Primary issue: UPI and bank-related failures are unusually high between 7 PM and 9 PM due to NPCI PSP peak load.`}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Failed: </span>
                <span className="text-slate-200 font-bold">{overviewData?.totalFailedPaymentsCount || 0}</span>
              </div>
              <div className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Revenue At Risk: </span>
                <span className="text-rose-400 font-bold">₹{(overviewData?.totalRevenueAtRisk || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Potentially Recoverable: </span>
                <span className="text-emerald-400 font-bold">₹{(overviewData?.totalPotentiallyRecoverable || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAILURE CATEGORY CARDS GRID */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Failure Categories
          </h2>
          <span className="text-xs text-slate-400">Click a category card to inspect affected customers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(cat => (
            <FailureCategoryCard
              key={cat.category}
              categoryData={cat}
              isSelected={selectedCategory === cat.category}
              onClick={() => handleCategorySelect(cat.category)}
            />
          ))}
        </div>
      </div>

      {/* CATEGORY DETAILS & AFFECTED CUSTOMERS TABLE */}
      {selectedCategory && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">Category Details View</span>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  {selectedCategory.replace(/_/g, ' ')} ISSUES
                </h3>
              </div>

              <div className="flex gap-4 text-xs">
                <div className="text-right">
                  <p className="text-slate-400">Affected Customers</p>
                  <p className="text-sm font-bold text-slate-100">{activeCard.affectedCustomers || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Revenue At Risk</p>
                  <p className="text-sm font-bold text-rose-400">₹{(activeCard.revenueAtRisk || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Potentially Recoverable</p>
                  <p className="text-sm font-bold text-emerald-400">₹{(activeCard.potentiallyRecoverable || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* AI Insight & Recommended Action Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Pattern Insight
                </span>
                <p className="text-slate-300">
                  {selectedCategory === 'CUSTOMER_SIDE'
                    ? 'Failures caused by customer cancellations or OTP drop-offs respond best to delayed 1-hour retries when customer attention is restored.'
                    : selectedCategory === 'MERCHANT_SIDE'
                    ? 'Merchant gateway configuration issues require alternate payment routes to recover revenue safely.'
                    : 'Transaction timeout failures are highly retryable using fresh payment links after server stabilization.'}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Recommended Recovery Strategy
                </span>
                <p className="text-slate-300">{activeCard.recommendedAction}</p>
              </div>
            </div>

            {/* Affected Customers Table Component */}
            {loadingCustomers ? (
              <LoadingState message="Loading affected customers for selected category..." />
            ) : (
              <AffectedCustomersTable
                customers={categoryCustomers}
                onPrepareCampaign={handlePrepareCampaign}
              />
            )}
          </div>
        </div>
      )}

      {/* SCHEDULED RECOVERIES & CAMPAIGN HISTORY PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
        <ScheduledRecoveryPanel />
        <CampaignHistory />
      </div>

      {/* RECOVERY CAMPAIGN PREVIEW MODAL */}
      <RecoveryCampaignModal
        isOpen={activeModal}
        onClose={() => setActiveModal(false)}
        failureCategory={selectedCategory}
        selectedCustomers={selectedCustomerList}
        onSuccess={handleCampaignSuccess}
      />
    </div>
  );
};
