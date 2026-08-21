import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Send, CheckSquare, Square, Shield, AlertCircle } from 'lucide-react';

export const AffectedCustomersTable = ({ customers = [], onPrepareCampaign }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW
  const [sortBy, setSortBy] = useState('score_desc'); // score_desc, score_asc, amount_desc, amount_asc
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Auto-select HIGH score customers by default
  useEffect(() => {
    const defaultSelected = new Set();
    customers.forEach(c => {
      if (c.recoveryScore >= 80) {
        defaultSelected.add(c.failureId);
      }
    });
    setSelectedIds(defaultSelected);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch =
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.failureSubReason.toLowerCase().includes(searchTerm.toLowerCase());

      let matchScore = true;
      if (scoreFilter === 'HIGH') matchScore = c.recoveryScore >= 80;
      else if (scoreFilter === 'MEDIUM') matchScore = c.recoveryScore >= 50 && c.recoveryScore < 80;
      else if (scoreFilter === 'LOW') matchScore = c.recoveryScore < 50;

      return matchSearch && matchScore;
    }).sort((a, b) => {
      if (sortBy === 'score_desc') return b.recoveryScore - a.recoveryScore;
      if (sortBy === 'score_asc') return a.recoveryScore - b.recoveryScore;
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [customers, searchTerm, scoreFilter, sortBy]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.failureId)));
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleTriggerCampaign = () => {
    const selectedList = customers.filter(c => selectedIds.has(c.failureId));
    onPrepareCampaign(selectedList);
  };

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, sub-reason..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Score Filter */}
          <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5" /> Score:
            </span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(tier => (
              <button
                key={tier}
                onClick={() => setScoreFilter(tier)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  scoreFilter === tier
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs rounded-lg px-3 py-2 border border-slate-800 outline-none cursor-pointer"
          >
            <option value="score_desc">Sort: Highest Recovery Score</option>
            <option value="score_asc">Sort: Lowest Recovery Score</option>
            <option value="amount_desc">Sort: Highest Failed Amount</option>
            <option value="amount_asc">Sort: Lowest Failed Amount</option>
          </select>

          {/* Campaign Action Button */}
          <button
            disabled={selectedIds.size === 0}
            onClick={handleTriggerCampaign}
            className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 whitespace-nowrap transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Prepare Campaign ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="fintech-card overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredCustomers.length}
                    onChange={toggleSelectAll}
                    className="accent-indigo-500 cursor-pointer rounded"
                  />
                </th>
                <th className="p-3.5">Customer Name & Email</th>
                <th className="p-3.5">Failed Amount</th>
                <th className="p-3.5">Sub-Reason</th>
                <th className="p-3.5">Recovery Score</th>
                <th className="p-3.5">Recommended Action</th>
                <th className="p-3.5 text-right">Selection State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No affected customers found matching filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const isChecked = selectedIds.has(c.failureId);
                  return (
                    <tr
                      key={c.failureId}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isChecked ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(c.failureId)}
                          className="accent-indigo-500 cursor-pointer rounded"
                        />
                      </td>
                      <td className="p-3.5 font-medium">
                        <p className="text-slate-100 font-semibold">{c.customerName}</p>
                        <p className="text-[11px] text-slate-400">{c.customerEmail}</p>
                      </td>
                      <td className="p-3.5 font-bold text-rose-400">
                        ₹{c.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded font-mono text-[11px] text-slate-300">
                          {c.failureSubReason}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                            c.recoveryScore >= 80
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : c.recoveryScore >= 50
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {c.recoveryScore}% ({c.recoveryScoreTag})
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-xs">
                        <p className="truncate">{c.recommendedAction}</p>
                      </td>
                      <td className="p-3.5 text-right font-medium">
                        {isChecked ? (
                          <span className="text-indigo-400 text-[11px] font-bold">Selected</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unselected</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
