import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

const MOCK_COMPLAINTS: Record<string, { status: string; title: string; location: string; color: string; icon: React.ReactNode }> = {
  'CF-2026-0012': {
    status: 'In Progress',
    title: 'Large Pothole on FC Road',
    location: 'FC Road, Shivajinagar, Pune',
    color: '#3B82F6',
    icon: <Clock className="w-4 h-4" style={{ color: '#3B82F6' }} />,
  },
  'CF-2026-0017': {
    status: 'Reported',
    title: 'Water Pipeline Leakage',
    location: 'Kothrud, Pune',
    color: '#F59E0B',
    icon: <AlertCircle className="w-4 h-4" style={{ color: '#F59E0B' }} />,
  },
  'CF-2026-0005': {
    status: 'Resolved',
    title: 'Overflowing Waste Bin',
    location: 'Mandai Market, Pune',
    color: '#22C55E',
    icon: <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />,
  },
  'CF-2026-0023': {
    status: 'In Progress',
    title: 'Pothole on MG Road',
    location: 'MG Road, Pune',
    color: '#3B82F6',
    icon: <Clock className="w-4 h-4" style={{ color: '#3B82F6' }} />,
  },
};

export const TrackComplaint: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<typeof MOCK_COMPLAINTS[string] | null | 'not-found'>(null);

  const handleSearch = () => {
    const key = inputValue.trim().toUpperCase();
    const found = MOCK_COMPLAINTS[key];
    setResult(found ?? 'not-found');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

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
            placeholder="e.g. CF-2026-0012"
            className="flex-1 px-3 py-2 rounded-lg bg-[#0F1E33] border border-[#1E355B]/60 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#14B8A6]/50 focus:ring-1 focus:ring-[#14B8A6]/20 font-mono transition-all"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-lg bg-[#0F766E]/80 hover:bg-[#0F766E] border border-[#14B8A6]/30 text-[#A7F3D0] transition-all hover:shadow-[0_0_12px_-3px_rgba(20,184,166,0.4)]"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Result */}
        {result && result !== 'not-found' && (
          <div className="mt-3 p-3 rounded-xl bg-[#0F1E33] border border-[#1E355B]/60">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{result.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{result.title}</p>
                <p className="text-xs text-slate-500 truncate">{result.location}</p>
                <span
                  className="inline-block mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: result.color, backgroundColor: `${result.color}18`, border: `1px solid ${result.color}30` }}
                >
                  {result.status}
                </span>
              </div>
            </div>
          </div>
        )}

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
