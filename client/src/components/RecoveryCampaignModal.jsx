import React, { useState, useEffect } from 'react';
import { X, Send, Clock, AlertTriangle, CheckCircle, Shield, Mail, RefreshCw, Zap, Link as LinkIcon, Building2, Layers } from 'lucide-react';
import { EmailPreview } from './EmailPreview';
import api from '../services/api';

export const RecoveryCampaignModal = ({ isOpen, onClose, failureCategory, selectedCustomers, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [selectedBankRoute, setSelectedBankRoute] = useState('SECONDARY_RAZORPAY_ACCOUNT');
  const [testMessage, setTestMessage] = useState(null);

  useEffect(() => {
    if (!isOpen || !selectedCustomers || selectedCustomers.length === 0) return;

    const fetchPreview = async () => {
      setLoading(true);
      try {
        const failureIds = selectedCustomers.map(c => c.failureId);
        const res = await api.post('/recovery-campaigns/preview', {
          failureCategory,
          selectedFailureIds: failureIds
        });
        if (res.data.success) {
          setPreviewData(res.data);
        }
      } catch (err) {
        console.error('Failed to preview campaign:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [isOpen, failureCategory, selectedCustomers]);

  if (!isOpen) return null;

  const handleSendTest = async () => {
    try {
      setTestMessage({ type: 'info', text: 'Sending test email...' });
      const res = await api.post('/recovery-campaigns/send-test', {
        failureCategory,
        testEmail: testEmail || undefined
      });
      if (res.data.success) {
        setTestMessage({ type: 'success', text: res.data.message });
      }
    } catch (err) {
      setTestMessage({ type: 'error', text: 'Failed to send test email' });
    }
  };

  const handleExecuteCampaign = async (actionType) => {
    setExecuting(true);
    try {
      const failureIds = selectedCustomers.map(c => c.failureId);
      const res = await api.post('/recovery-campaigns/create', {
        failureCategory,
        selectedFailureIds: failureIds,
        actionType,
        customLink: customLink.trim() || undefined,
        bankRoute: selectedBankRoute
      });
      if (res.data.success) {
        onSuccess(res.data.message);
        onClose();
      }
    } catch (err) {
      console.error('Campaign execution failed:', err);
    } finally {
      setExecuting(false);
    }
  };

  const displayHtml = previewData?.emailHtmlPreview
    ? (customLink.trim() 
        ? previewData.emailHtmlPreview.replace(/https:\/\/payguard\.ai\/r\/sample_recovery_link/g, customLink.trim())
        : previewData.emailHtmlPreview)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">Recovery Campaign Configuration</span>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              {failureCategory} Email Campaign
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Compiling category templates & generating Razorpay payment links...</p>
            </div>
          ) : (
            <>
              {/* Campaign Stats Bar */}
              <div className="grid grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Selected</p>
                  <p className="text-base font-bold text-slate-100">{previewData?.recipientCount || selectedCustomers.length} Customers</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">High Recovery</p>
                  <p className="text-base font-bold text-emerald-400">{previewData?.highRecoveryCount || 0} Priority</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Revenue At Risk</p>
                  <p className="text-base font-bold text-rose-400">₹{(previewData?.totalRisk || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Potentially Recoverable</p>
                  <p className="text-base font-bold text-indigo-400">₹{(previewData?.totalRecoverable || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Special Merchant-Side Bank Failure Routing Banner */}
              {failureCategory === 'MERCHANT_SIDE' && (
                <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-red-300 text-xs">Primary Merchant Gateway / Bank Account Failed</p>
                      <p className="text-xs text-slate-300">
                        PayGuard AI detected that your primary merchant bank account or gateway route is inactive/failing. Select a secondary bank route or enter a new bank payment link below:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <label
                      onClick={() => setSelectedBankRoute('SECONDARY_RAZORPAY_ACCOUNT')}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
                        selectedBankRoute === 'SECONDARY_RAZORPAY_ACCOUNT'
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="font-bold text-xs">Route via Backup Bank Account (Route #2)</p>
                        <p className="text-[10px] text-slate-400">HDFC Secondary Merchant Account</p>
                      </div>
                    </label>

                    <label
                      onClick={() => setSelectedBankRoute('CUSTOM_BANK_LINK')}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
                        selectedBankRoute === 'CUSTOM_BANK_LINK'
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="font-bold text-xs">Custom Alternate Bank Payment Link</p>
                        <p className="text-[10px] text-slate-400">Use URL specified in input box below</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Custom Recovery Link Input */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-indigo-400" />
                  {failureCategory === 'MERCHANT_SIDE' 
                    ? 'Enter Alternate Merchant Bank Account Payment Link / UPI Link:'
                    : 'Custom Merchant Recovery URL / Redirect Link (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder={failureCategory === 'MERCHANT_SIDE' 
                    ? "https://your-backup-bank.com/pay/merchant_account_2 or https://upilink.me/merchant_backup"
                    : "https://yourstore.com/checkout/retry (Leave empty for auto-generated Razorpay link)"
                  }
                  value={customLink}
                  onChange={e => setCustomLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  {failureCategory === 'MERCHANT_SIDE' 
                    ? 'Aap apna koi bhi secondary bank account link, alternative payment gateway link ya custom UPI link yahan daal sakte hain.'
                    : 'Default: PayGuard AI automatically creates individual unique Razorpay Payment Links (`https://rzp.io/i/...`) per recipient.'}
                </p>
              </div>

              {/* Special Customer-Side 1-Hour Schedule Banner */}
              {failureCategory === 'CUSTOMER_SIDE' && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-300">Exact 1-Hour Retry Rule Active</p>
                    <p className="text-slate-300">
                      Customer-side failures require a delay to prevent spam. Emails are automatically calculated from the original payment failure timestamp:
                    </p>
                    <p className="font-mono text-amber-400 text-[11px]">
                      scheduledFor = failureOccurredAt + 1 hour
                    </p>
                    <div className="inline-block mt-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px] text-amber-300 font-semibold">
                      ⚡ DEMO ACCELERATED TIME ACTIVE (Testing Delay: +2 Mins)
                    </div>
                  </div>
                </div>
              )}

              {/* Email Template Preview Component */}
              {previewData && (
                <EmailPreview
                  subject={previewData.emailSubject}
                  htmlBody={displayHtml}
                  category={failureCategory}
                />
              )}

              {/* Test Email Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Send Test Email</label>
                  <input
                    type="email"
                    placeholder="Enter test email (default: demo@payguard.ai)"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>
                <button
                  onClick={handleSendTest}
                  className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold self-end md:self-auto border border-slate-700 transition-colors"
                >
                  Send Test Email
                </button>
              </div>

              {testMessage && (
                <p className={`text-xs text-center font-medium ${testMessage.type === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {testMessage.text}
                </p>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {failureCategory !== 'CUSTOMER_SIDE' && (
              <button
                disabled={executing || loading}
                onClick={() => handleExecuteCampaign('SEND_NOW')}
                className="py-2.5 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Zap className="w-4 h-4" />
                {executing ? 'Executing...' : 'Send Now (Immediate)'}
              </button>
            )}

            <button
              disabled={executing || loading}
              onClick={() => handleExecuteCampaign('SCHEDULE')}
              className="py-2.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Clock className="w-4 h-4" />
              {executing ? 'Scheduling...' : 'Schedule Recovery Emails'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
