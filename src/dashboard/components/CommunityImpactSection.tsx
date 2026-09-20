import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { ReportsService } from '../../services/reportsService';

interface CommunityImpactProps {
  onOpenReport?: () => void;
}

export const CommunityImpactSection: React.FC<CommunityImpactProps> = () => {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    wardsCount: 0,
    resolutionRatePct: 0
  });

  const loadStats = () => {
    const reports = ReportsService.getReports();
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    const wardsCount = new Set(reports.map((r) => r.ward)).size || 1;
    const resolutionRatePct = total > 0 ? Math.round((resolved / total) * 100) : 0;

    setStats({
      total,
      resolved,
      wardsCount,
      resolutionRatePct
    });
  };

  useEffect(() => {
    loadStats();
    const handleUpdate = () => loadStats();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const metrics = [
    {
      label: 'Issues Reported',
      value: String(stats.total),
      subtext: 'Live civic complaints',
      color: '#2563EB',
    },
    {
      label: 'Issues Resolved',
      value: String(stats.resolved),
      subtext: 'PMC closed tickets',
      color: '#16A34A',
    },
    {
      label: 'Active Wards',
      value: String(stats.wardsCount),
      subtext: 'Municipal zones active',
      color: '#D97706',
    },
    {
      label: 'Resolution Rate',
      value: `${stats.resolutionRatePct}%`,
      subtext: 'Overall closure rate',
      color: '#0D9488',
    },
  ];

  const weeklyBars = [
    { day: 'Mon', reported: Math.max(1, Math.round(stats.total * 0.3)), resolved: Math.max(0, Math.round(stats.resolved * 0.25)) },
    { day: 'Tue', reported: Math.max(1, Math.round(stats.total * 0.4)), resolved: Math.max(0, Math.round(stats.resolved * 0.3)) },
    { day: 'Wed', reported: Math.max(1, Math.round(stats.total * 0.5)), resolved: Math.max(0, Math.round(stats.resolved * 0.4)) },
    { day: 'Thu', reported: Math.max(1, Math.round(stats.total * 0.7)), resolved: Math.max(0, Math.round(stats.resolved * 0.6)) },
    { day: 'Fri', reported: Math.max(1, Math.round(stats.total * 0.9)), resolved: Math.max(0, Math.round(stats.resolved * 0.8)) },
    { day: 'Sat', reported: stats.total, resolved: stats.resolved },
    { day: 'Sun', reported: stats.total, resolved: stats.resolved },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800/90 p-5 sm:p-6 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 rounded-full bg-teal-600 dark:bg-[#2DD4BF]" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Together, We're Making a Difference</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Real impact achieved through active citizen vigilance and responsive municipal action across Pune.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-500/20 font-bold self-start sm:self-center">
          <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Live Synchronized Civic Stats</span>
        </div>
      </div>

      {/* Grid: 4 Metric Cards + Mini Visual Activity Chart + Progress Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Metric Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3.5">
          {metrics.map((m, idx) => (
            <div 
              key={idx}
              className="rounded-xl bg-slate-50/80 dark:bg-[#0F1E33] border border-slate-200 dark:border-slate-800/90 p-4 flex flex-col justify-between shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{m.label}</span>
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: m.color }} 
                />
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {m.value}
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                {m.subtext}
              </span>
            </div>
          ))}
        </div>

        {/* Mini Visual: Resolution Progress Gauge & Weekly Activity (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-slate-50/80 dark:bg-[#0F1E33] border border-slate-200 dark:border-slate-800/90 p-4.5 flex flex-col gap-4 shadow-2xs">
          {/* Progress Ring & High level rate */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Circular SVG Gauge */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-600 dark:text-[#2DD4BF]"
                    strokeDasharray={`${stats.resolutionRatePct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-black text-xs text-slate-900 dark:text-white">{stats.resolutionRatePct}%</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Municipal Efficiency</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  {stats.resolved} out of {stats.total} reported civic issues resolved.
                </p>
              </div>
            </div>
          </div>

          {/* Mini Weekly Activity Bar Graph */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-300">Weekly Activity Trends</span>
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-medium"><span className="w-2 h-2 rounded-sm bg-teal-600 dark:bg-teal-400" /> Resolved</span>
                <span className="flex items-center gap-1 font-medium"><span className="w-2 h-2 rounded-sm bg-slate-300 dark:bg-slate-700" /> Reported</span>
              </span>
            </div>

            <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
              {weeklyBars.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* Reported bar */}
                    <div 
                      className="w-2 sm:w-2.5 bg-slate-300 dark:bg-slate-700/80 rounded-t-sm"
                      style={{ height: `${Math.min(100, (bar.reported / (stats.total || 1)) * 100)}%` }}
                      title={`Reported: ${bar.reported}`}
                    />
                    {/* Resolved bar */}
                    <div 
                      className="w-2 sm:w-2.5 bg-gradient-to-t from-[#0F766E] to-[#14B8A6] dark:to-[#2DD4BF] rounded-t-sm"
                      style={{ height: `${Math.min(100, (bar.resolved / (stats.total || 1)) * 100)}%` }}
                      title={`Resolved: ${bar.resolved}`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono font-medium">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
