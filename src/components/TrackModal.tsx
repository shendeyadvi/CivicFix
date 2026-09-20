import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { HERO_MAP_ISSUES, type CivicIssue } from '../data/mockData';

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackModal: React.FC<TrackModalProps> = ({ isOpen, onClose }) => {
  const [searchId, setSearchId] = useState<string>('CF-2026-8942');
  const [matchedIssue, setMatchedIssue] = useState<CivicIssue>(HERO_MAP_ISSUES[0]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toUpperCase();
    const found = HERO_MAP_ISSUES.find(
      (i) => i.trackingId.toUpperCase() === query || i.id.toLowerCase() === query.toLowerCase()
    );
    if (found) {
      setMatchedIssue(found);
    } else {
      // Default to first with updated ID if not found in mock list
      setMatchedIssue({
        ...HERO_MAP_ISSUES[0],
        trackingId: query.startsWith('CF-') ? query : `CF-${query}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0B192C] border-2 border-slate-200 dark:border-[#1E355B] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-100 dark:bg-[#0F1E33] px-6 py-4 border-b border-slate-200 dark:border-[#1E355B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-200 dark:border-deepTeal-600 flex items-center justify-center">
              <Search className="w-4 h-4 text-deepTeal-600 dark:text-softMint-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Track Public Report Status
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enter your Ticket ID for real-time Pune municipal audit status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white dark:bg-[#081220] border border-slate-300 dark:border-[#162846] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Search Bar Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. CF-2026-8942"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:border-deepTeal-500 focus:ring-1 focus:ring-deepTeal-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-deepTeal-600 hover:bg-deepTeal-500 text-slate-950 font-bold text-sm transition-all shadow-sm"
            >
              Lookup
            </button>
          </form>

          {/* Quick Ticket Pill Suggestion */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 dark:text-slate-400">Quick Try:</span>
            {HERO_MAP_ISSUES.map((issue) => (
              <button
                key={issue.trackingId}
                type="button"
                onClick={() => {
                  setSearchId(issue.trackingId);
                  setMatchedIssue(issue);
                }}
                className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-deepTeal-700 dark:text-softMint-300 hover:text-deepTeal-900 dark:hover:text-white"
              >
                {issue.trackingId}
              </button>
            ))}
          </div>

          {/* Ticket Result Details */}
          {matchedIssue && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-deepTeal-800/80 space-y-4 shadow-sm">
              
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#162846]">
                <div>
                  <span className="text-xs font-mono font-bold text-deepTeal-700 dark:text-softMint-400">
                    {matchedIssue.trackingId}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {matchedIssue.title}
                  </h4>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${matchedIssue.statusColor}22`,
                    color: matchedIssue.statusColor,
                    border: `1px solid ${matchedIssue.statusColor}66`,
                  }}
                >
                  ● {matchedIssue.status}
                </div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-mono text-[11px]">Location</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{matchedIssue.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-mono text-[11px]">Department</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{matchedIssue.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-mono text-[11px]">Assigned Officer</span>
                  <span className="text-deepTeal-600 dark:text-softMint-300 font-semibold">{matchedIssue.assignedOfficer || 'In Queue'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-mono text-[11px]">Target Resolution</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{matchedIssue.estimatedFixTime || '48 Hours'}</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#162846]">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-3">
                  Live Dispatch Status
                </h5>
                <div className="space-y-2">
                  {matchedIssue.timeline.map((step, idx) => (
                    <div
                      key={step.step}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            step.completed
                              ? 'bg-status-success text-slate-950'
                              : 'bg-slate-200 dark:bg-[#162846] text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {step.completed ? '✓' : idx + 1}
                        </span>
                        <span className={`text-xs font-semibold ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                          {step.step}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {step.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
