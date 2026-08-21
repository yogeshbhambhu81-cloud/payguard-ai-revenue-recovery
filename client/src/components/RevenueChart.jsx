import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const RevenueChart = ({ data }) => {
  const chartData = data?.dailyTrend || [
    { date: 'Mon', revenue: 680000, failedAmount: 45000 },
    { date: 'Tue', revenue: 720000, failedAmount: 52000 },
    { date: 'Wed', revenue: 810000, failedAmount: 48000 },
    { date: 'Thu', revenue: 790000, failedAmount: 61000 },
    { date: 'Fri', revenue: 842000, failedAmount: 72400 },
  ];

  return (
    <div className="fintech-card p-5 h-80 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Revenue & Revenue At Risk Trend</h3>
          <p className="text-xs text-slate-400">7-Day Gross Captured vs Failed Transaction Value</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Gross Revenue
          </div>
          <div className="flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Revenue At Risk
          </div>
        </div>
      </div>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#232F45" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
              formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" name="Captured Revenue" />
            <Area type="monotone" dataKey="failedAmount" stroke="#EF4444" fillOpacity={1} fill="url(#colorRisk)" name="Revenue At Risk" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
