import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { ReportsService, type CivicReportItem } from '../../services/reportsService';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Resolved':
    case 'Closed':
      return { color: '#22C55E', icon: <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} /> };
    case 'In Progress':
    case 'Assigned':
      return { color: '#3B82F6', icon: <Clock className="w-4 h-4" style={{ color: '#3B82F6' }} /> };
    case 'Overdue':
      return { color: '#EF4444', icon: <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} /> };
    case 'New':
    case 'Pending Verification':
    case 'Verified':
    default:
      return { color: '#F59E0B', icon: <AlertCircle className="w-4 h-4" style={{ color: '#F59E0B' }} /> };
  }
};

export const TrackComplaint: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<CivicReportItem | null | 'not-found' | 'loading'>(null);

  const handleSearch = async () => {
    const key = inputValue.trim();
    if (!key) return;

    setResult('loading');
    try {
      const report = await ReportsService.trackReport(key);
      setResult(report ?? 'not-found');
    } catch {
      setResult('not-found');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const resolvedResult = result !== 'loading' && result !== 'not-found' && result !== null ? result : null;
  const statusInfo = resolvedResult ? getStatusColor(resolvedResult.status) : null;

  return (
    <div className="rounded-2xl border border-[#1E355B]/60 bg-[#0A1628] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#1E355B]/40">
        <h2 className="text-sm font-bold text-white tracking-tight">Track Your Complaint</h2>
        <p className="text-xs text-slate-500 mt-0.5">Enter your complaint ID to check the latest status.</p>
      </div>

      {/* Input */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. CF-2026-8904"
            className="flex-1 px-3 py-2 rounded-lg bg-[#0F1E33] border border-[#1E355B]/60 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#14B8A6]/50 focus:ring-1 focus:ring-[#14B8A6]/20 font-mono transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={result === 'loading'}
            className="px-3 py-2 rounded-lg bg-[#0F766E]/80 hover:bg-[#0F766E] border border-[#14B8A6]/30 text-[#A7F3D0] transition-all hover:shadow-[0_0_12px_-3px_rgba(20,184,166,0.4)] disabled:opacity-50"
          >
            {result === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Loading */}
        {result === 'loading' && (
          <div className="mt-3 p-3 rounded-xl bg-[#0F1E33] border border-[#1E355B]/60 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
            <p className="text-xs text-slate-400">Looking up complaint in database…</p>
          </div>
        )}

        {/* Found Result */}
        {resolvedResult && statusInfo && (
          <div className="mt-3 p-3 rounded-xl bg-[#0F1E33] border border-[#1E355B]/60 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{statusInfo.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{resolvedResult.title}</p>
                <p className="text-xs text-slate-500 truncate">{resolvedResult.location}</p>
                <span
                  className="inline-block mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: statusInfo.color,
                    backgroundColor: `${statusInfo.color}18`,
                    border: `1px solid ${statusInfo.color}30`,
                  }}
                >
                  {resolvedResult.status}
                </span>
              </div>
            </div>
            {/* Extra details */}
            <div className="pt-2 border-t border-[#1E355B]/40 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Ticket ID</span>
                <span className="text-slate-300 font-mono font-bold">{resolvedResult.trackingId}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Department</span>
                <span className="text-slate-300 font-semibold">{resolvedResult.department}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Reported</span>
                <span className="text-slate-300">{resolvedResult.date}</span>
              </div>
            </div>
          </div>
        )}

        {/* Not Found */}
        {result === 'not-found' && (
          <div className="mt-3 p-3 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/20 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
            <p className="text-xs text-[#EF4444]">Complaint ID not found. Please check and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};
