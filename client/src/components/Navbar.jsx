import React from 'react';
import { ShieldCheck, RefreshCw, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { triggerSeedData } from '../services/recoveryApi';

export const Navbar = ({ onRefresh, onOpenCopilot }) => {
  const { user, demoMode } = useAuth();
  const [seeding, setSeeding] = React.useState(false);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await triggerSeedData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to re-seed data:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B1019]/90 backdrop-blur-xl border-b border-white/5 px-6 py-3.5 flex items-center justify-between shrink-0 select-none">
      {/* Brand & Demo Mode Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 text-indigo-400 font-extrabold text-xl tracking-tight">
          <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-md shadow-indigo-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span>PayGuard<span className="text-white">.AI</span></span>
        </div>

        {demoMode && (
          <span className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            DEMO MODE (Seeded Data)
          </span>
        )}
      </div>

      {/* Action Buttons & User Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600/20 to-indigo-500/10 hover:from-indigo-600/30 hover:to-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/10"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>PayGuard Copilot</span>
        </button>

        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Seeding Payments...' : 'Re-seed Demo Data'}</span>
        </button>

        <div className="pl-3 border-l border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-500/40 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <UserIcon className="w-4 h-4 text-indigo-100" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-200">{user?.name || 'Demo Merchant'}</div>
            <div className="text-[10px] text-slate-400 font-medium">{user?.businessName || 'Apex Fashion & Tech India'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
