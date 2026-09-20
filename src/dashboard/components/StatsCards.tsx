import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { ReportsService } from '../../services/reportsService';

interface StatsCardsProps {
  onCardClick?: (filter: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ onCardClick }) => {
  const [counts, setCounts] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
  });

  const updateCounts = () => {
    const reports = ReportsService.getReports();
    const total = reports.length;
    const inProgress = reports.filter((r) => r.status === 'In Progress').length;
    const resolved = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;

    setCounts({ total, inProgress, resolved });
  };

  useEffect(() => {
    updateCounts();
    const handleUpdate = () => updateCounts();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const stats = [
    {
      id: 'my-reports',
      label: 'Total Reports',
      count: String(counts.total),
      description: 'Total reports in system',
      icon: ClipboardList,
      color: '#2563EB',
      lightBg: 'bg-blue-50/70 border-blue-200/80',
      darkBg: 'dark:bg-[#0B192C] dark:border-blue-500/20 dark:hover:border-blue-500/40',
      badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
      trend: `${counts.total} active`,
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: String(counts.inProgress),
      description: 'Currently being addressed',
      icon: Clock,
      color: '#D97706',
      lightBg: 'bg-amber-50/70 border-amber-200/80',
      darkBg: 'dark:bg-[#0B192C] dark:border-amber-500/20 dark:hover:border-amber-500/40',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
      trend: counts.inProgress > 0 ? `${counts.inProgress} active reviews` : 'No active reviews',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      count: String(counts.resolved),
      description: 'Issues resolved so far',
      icon: CheckCircle2,
      color: '#16A34A',
      lightBg: 'bg-emerald-50/70 border-emerald-200/80',
      darkBg: 'dark:bg-[#0B192C] dark:border-emerald-500/20 dark:hover:border-emerald-500/40',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400',
      trend: counts.resolved > 0 ? `${Math.round((counts.resolved / (counts.total || 1)) * 100)}% closure` : '0% closure',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            onClick={() => onCardClick && onCardClick(stat.id)}
            className={`relative overflow-hidden rounded-2xl bg-white ${stat.lightBg} ${stat.darkBg} border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-md cursor-pointer group`}
          >
            {/* Top row: Icon + Trend Badge */}
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${stat.color}18`, color: stat.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${stat.badgeClass} flex items-center gap-1 shadow-2xs`}>
                {stat.trend}
                <ArrowUpRight className="w-3 h-3 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>

            {/* Middle: Number Count */}
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                {stat.count}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {stat.label}
              </div>
            </div>

            {/* Bottom: Subtitle */}
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
