import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('demo@payguard.ai');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="fintech-card max-w-md w-full p-8 border-indigo-500/30">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">PayGuard AI</h1>
          <p className="text-xs text-slate-400">AI Revenue Recovery Agent for Razorpay Merchants</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Merchant Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#232F45] rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#232F45] rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-600/30 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Merchant Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#232F45] text-center text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-amber-400">Demo Merchant Credentials:</div>
          <div>Email: <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">demo@payguard.ai</code></div>
          <div>Password: <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">demo123</code></div>
        </div>
      </div>
    </div>
  );
};
