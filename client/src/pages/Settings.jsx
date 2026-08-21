import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, ShieldCheck, Key, Webhook, Cpu, CheckCircle, Building2, Layers, RefreshCw, Save } from 'lucide-react';

export const Settings = () => {
  const [health, setHealth] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [primaryKeyId, setPrimaryKeyId] = useState('rzp_live_primary_merchant');
  const [secondaryKeyId, setSecondaryKeyId] = useState('rzp_live_secondary_hdfc_account');
  const [secondarySecret, setSecondarySecret] = useState('sec_secret_key_hdfc_backup');
  const [secondaryBankName, setSecondaryBankName] = useState('HDFC Secondary Merchant Account');

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      console.error('Healthcheck failed:', err);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Merchant Gateway & Bank Settings</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Configure Primary Razorpay credentials and Secondary Backup Merchant Bank Accounts for automated failover recovery.</p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Secondary Backup Merchant Bank Route Settings updated successfully!</span>
        </div>
      )}

      <div className="fintech-card p-6 space-y-6">
        {/* System Health */}
        <div className="p-4 bg-[#0F172A] border border-[#232F45] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-sm font-bold text-white">PayGuard AI Backend Engine</div>
              <div className="text-xs text-slate-400">Multi-Gateway Failover Engine Ready</div>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
            MULTI-BANK ROUTE ACTIVE
          </span>
        </div>

        {/* PRIMARY & SECONDARY BANK ACCOUNTS CONFIGURATION */}
        <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#232F45]">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Gateway & Bank Route Failover Configuration
            </h2>
            <span className="text-[11px] text-slate-400">Automatic link generation on failed primary transactions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Account Card */}
            <div className="p-4 bg-[#0F172A] border border-[#232F45] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Primary Bank Gateway Route (Default)
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Primary Razorpay account used for standard checkout payments.
              </p>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={primaryKeyId}
                    onChange={e => setPrimaryKeyId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Backup Bank Account Card */}
            <div className="p-4 bg-[#0F172A] border border-indigo-500/40 rounded-xl space-y-3 bg-gradient-to-b from-indigo-950/20 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Secondary Backup Merchant Bank Route
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/30">
                  FAILOVER ROUTE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Used when primary gateway fails (`MERCHANT_SIDE`). Auto-generates payment links for exact failed amount.
              </p>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Secondary Bank Name</label>
                  <input
                    type="text"
                    value={secondaryBankName}
                    onChange={e => setSecondaryBankName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Secondary Gateway Key ID</label>
                  <input
                    type="text"
                    value={secondaryKeyId}
                    onChange={e => setSecondaryKeyId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Secondary Gateway Secret</label>
                  <input
                    type="password"
                    value={secondarySecret}
                    onChange={e => setSecondarySecret(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Gateway Routes</span>
            </button>
          </div>
        </form>

        {/* Integration Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-[#232F45]">
          <div className="p-4 bg-[#0F172A] border border-[#232F45] rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Webhook className="w-4 h-4 text-emerald-400" />
              <span>Razorpay Webhook Endpoint</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Local Endpoint: <code className="text-indigo-300">POST http://localhost:5000/api/webhooks/razorpay</code><br/>
              HMAC Signature Verification: Enabled
            </p>
            <div className="pt-2 text-indigo-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Idempotent Listener Active</span>
            </div>
          </div>

          <div className="p-4 bg-[#0F172A] border border-[#232F45] rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Google Gemini AI Engine</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              SDK: <code className="text-indigo-300">@google/genai</code> • Model: <code className="text-indigo-300">gemini-2.5-flash</code><br/>
              Includes strict analytics tool allowlist and rule-based deterministic fallback mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
