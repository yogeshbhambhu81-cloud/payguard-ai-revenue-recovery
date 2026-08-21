import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, CornerDownLeft } from 'lucide-react';
import { sendCopilotQuery } from '../services/aiApi';

export const Copilot = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am PayGuard Copilot. Ask me about your payment performance, revenue at risk, or top recoverable failure opportunities.',
      toolUsed: null
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    "Why did my revenue drop today?",
    "Which payment failures should I recover first?",
    "How much revenue is at risk?",
    "What is causing most failures?",
    "Which customers are most likely to retry?"
  ];

  const handleSend = async (textToSend) => {
    const qText = textToSend || query;
    if (!qText.trim()) return;

    const userMsg = { sender: 'user', text: qText };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await sendCopilotQuery(qText);
      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.answer,
            toolUsed: res.data.toolUsed,
            aiAvailable: res.data.aiAvailable
          }
        ]);
      }
    } catch (err) {
      console.error('Copilot API error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'I am temporarily unable to reach the AI analytics engine. Please check your server connection.',
          toolUsed: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#151D2A] border-l border-[#232F45] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#232F45] flex items-center justify-between bg-[#0F172A]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">PayGuard Copilot</h3>
            <p className="text-[10px] text-slate-400">Merchant AI Analytics Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-xl ${m.sender === 'user' ? 'bg-indigo-600 text-white font-medium' : 'bg-[#0F172A] border border-[#232F45] text-slate-200'}`}>
              {m.toolUsed && (
                <div className="text-[10px] font-mono text-indigo-400 mb-1">
                  🔧 Executed: <strong>{m.toolUsed}()</strong>
                </div>
              )}
              <p className="leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Executing analytics tools & generating answer...</span>
          </div>
        )}
      </div>

      {/* Quick Questions & Input Bar */}
      <div className="p-3 border-t border-[#232F45] bg-[#0F172A] space-y-2.5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#232F45] text-slate-300 rounded-full text-[10px] font-medium whitespace-nowrap border border-[#334155] shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about payment analytics..."
            className="flex-1 bg-[#151D2A] border border-[#232F45] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
