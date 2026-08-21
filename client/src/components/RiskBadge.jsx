import React from 'react';

export const RiskBadge = ({ score, label }) => {
  let tier = 'HIGH';
  let colorStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  let dotStyle = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';

  const numericScore = score !== undefined ? Number(score) : (label === 'HIGH' ? 85 : label === 'MEDIUM' ? 65 : 40);

  if (numericScore >= 80) {
    tier = 'High';
    colorStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    dotStyle = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
  } else if (numericScore >= 55) {
    tier = 'Medium';
    colorStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    dotStyle = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
  } else {
    tier = 'Low';
    colorStyle = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    dotStyle = 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colorStyle} backdrop-blur-sm whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>
      <span>{tier} ({numericScore}%)</span>
    </span>
  );
};
