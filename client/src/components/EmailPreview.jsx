import React from 'react';
import { Mail, ShieldCheck, ExternalLink } from 'lucide-react';

export const EmailPreview = ({ subject, htmlBody, category }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      {/* Email Header Bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Email Campaign Preview</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
            {category} Template
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Sender: PayGuard AI Recovery</span>
      </div>

      {/* Subject Line */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/80 text-xs flex items-center gap-2">
        <span className="text-slate-400 font-semibold">Subject:</span>
        <span className="text-slate-100 font-medium">{subject}</span>
      </div>

      {/* Email Body Content */}
      <div className="p-6 bg-slate-900/20 text-slate-200 text-xs">
        <div 
          className="prose prose-invert max-w-none prose-sm"
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
      </div>

      {/* Template Dynamic Tags Footer */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Personalization Tokens: <code className="text-indigo-400">{`{{customerName}}`}</code>, <code className="text-indigo-400">{`{{amount}}`}</code>, <code className="text-indigo-400">{`{{paymentLink}}`}</code></span>
        <span className="flex items-center gap-1 text-slate-400"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Unique Link per Customer</span>
      </div>
    </div>
  );
};
