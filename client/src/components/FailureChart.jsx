import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const FailureChart = ({ data }) => {
  const hourlyData = data?.hourlyTrend || [
    { hour: '14:00', failures: 2 },
    { hour: '15:00', failures: 3 },
    { hour: '16:00', failures: 4 },
    { hour: '17:00', failures: 5 },
    { hour: '18:00', failures: 8 },
    { hour: '19:00', failures: 38 }, // 7 PM Spike
    { hour: '20:00', failures: 37 }, // 8 PM Spike
    { hour: '21:00', failures: 12 },
    { hour: '22:00', failures: 5 },
  ];

  return (
    <div className="fintech-card p-5 h-80 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Hourly Payment Failure Distribution</h3>
          <p className="text-xs font-medium text-amber-400">⚡ Anomaly Detected: 7 PM - 9 PM UPI PSP Spike</p>
        </div>
      </div>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232F45" />
            <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
            />
            <Bar dataKey="failures" radius={[4, 4, 0, 0]}>
              {hourlyData.map((entry, index) => {
                const isSpike = entry.hour.includes('19:00') || entry.hour.includes('20:00');
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={isSpike ? '#EF4444' : '#3B82F6'} 
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
