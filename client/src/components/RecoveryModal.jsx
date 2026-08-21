import React, { useState } from 'react';
import { X, Check, Copy, Link as LinkIcon, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { createPaymentLink } from '../services/recoveryApi';
import { formatCurrency } from '../utils/formatCurrency';
import { RiskBadge } from './RiskBadge';
import api from '../services/api';

export const RecoveryModal = ({ payment, onClose, onRecoverySuccess }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [recoveredSuccess, setRecoveredSuccess] = useState(false);

  React.useEffect(() => {
    if (payment) {
      handleGenerate();
    }
  }, [payment]);

  const handleGenerate = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const targetPaymentId = payment.mongoPaymentId || (typeof payment.paymentId === 'object' ? payment.paymentId?._id : payment.paymentId) || payment._id;
      const res = await createPaymentLink(targetPaymentId);
      if (res.success) {
        setRecoveryData(res.data);
      }
    } catch (err) {
      console.error('Failed to create Razorpay Payment Link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (recoveryData?.paymentLinkUrl) {
      navigator.clipboard.writeText(recoveryData.paymentLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Demo flow: Simulate Webhook event arrival to mark payment as recovered
  const handleSimulateWebhookPaid = async () => {
    setSimulatingWebhook(true);
    try {
      const refId = recoveryData?.referenceId;
      const pLinkId = recoveryData?.paymentLinkId;
      
      // Post mock webhook payload directly to webhook handler
      await api.post('/webhooks/razorpay', {
        event: 'payment_link.paid',
        account_id: 'acc_demo_test',
        created_at: Math.floor(Date.now() / 1000),
        payload: {
          payment_link: {
            entity: {
              id: pLinkId,
              reference_id: refId,
              amount: (payment.amount || 2499) * 100,
              status: 'paid'
            }
          },
          payment: {
            entity: {
              id: `pay_rec_${Date.now().toString().slice(-6)}`,
              amount: (payment.amount || 2499) * 100,
              status: 'captured',
              payment_link_id: pLinkId,
              notes: { reference_id: refId }
            }
          }
        }
      }, {
        headers: { 'x-demo-simulation': 'true' }
      });

      setRecoveredSuccess(true);
      if (onRecoverySuccess) onRecoverySuccess();
    } catch (err) {
      console.error('Error simulating webhook:', err);
    } finally {
      setSimulatingWebhook(false);
    }
  };

  if (!payment) return null;

  const cust = payment.customer || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Razorpay Payment Link</div>
            <h2 className="text-base font-bold text-white">Recovery Action Initiated</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Generating Razorpay Payment Link with reference_id...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Name:</span>
                <strong className="text-white">{cust.name || 'Rahul Sharma'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Amount:</span>
                <strong className="text-emerald-400 font-extrabold">{formatCurrency(payment.amount)}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recovery Score:</span>
                <RiskBadge score={payment.recoveryScore || 87} />
              </div>
            </div>

            {/* Generated Link Display */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Razorpay Payment Link URL</label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="text"
                  readOnly
                  value={recoveryData?.paymentLinkUrl || 'Generating link...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-md shadow-indigo-600/20"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Simulated Webhook Section for Demo */}
            {recoveredSuccess ? (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>{formatCurrency(payment.amount)} successfully recovered! Dashboard updated.</span>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Demo Webhook Tester</span>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">payment_link.paid</span>
                </div>
                <button
                  onClick={handleSimulateWebhookPaid}
                  disabled={simulatingWebhook}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${simulatingWebhook ? 'animate-spin' : ''}`} />
                  <span>Simulate Webhook (Complete Recovery)</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
