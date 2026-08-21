import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  Settings 
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Failure Analysis', path: '/failure-analysis', icon: AlertTriangle, badge: 'AI', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { name: 'Failed Payments', path: '/failed-payments', icon: AlertTriangle, badge: '300', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { name: 'All Payments', path: '/payments', icon: CreditCard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Recovery Actions', path: '/recovery', icon: ArrowUpRight },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-white/5 h-full p-4 flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-1">
        <div className="px-3.5 py-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          Merchant Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl text-xs space-y-2 backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-300 font-bold text-[11px]">
          <span>Razorpay Integration</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          Webhook Listener Active • Idempotency Enabled
        </div>
      </div>
    </aside>
  );
};
