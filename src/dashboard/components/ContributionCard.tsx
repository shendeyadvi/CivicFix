import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ReportsService } from '../../services/reportsService';

interface ContributionCardProps {
  totalReported?: number;
  totalResolved?: number;
}

export const ContributionCard: React.FC<ContributionCardProps> = ({
  totalReported,
  totalResolved,
}) => {
  const [counts, setCounts] = useState({
    reported: totalReported || 0,
    resolved: totalResolved || 0,
  });

  const loadCounts = () => {
    if (totalReported !== undefined && totalResolved !== undefined) {
      setCounts({ reported: totalReported, resolved: totalResolved });
      return;
    }
    const reports = ReportsService.getReports();
    const rep = reports.length;
    const res = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    setCounts({ reported: rep, resolved: res });
  };

  useEffect(() => {
    loadCounts();
    const handleUpdate = () => loadCounts();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, [totalReported, totalResolved]);

  const resolutionPercentage = counts.reported > 0 ? Math.round((counts.resolved / counts.reported) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800/90 p-5 sm:p-6 shadow-sm relative overflow-hidden transition-colors duration-300">
      {/* Subtle background gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-[#2DD4BF] flex items-center justify-center border border-teal-200 dark:border-teal-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Civic Contribution</h3>
          </div>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            You’ve helped report <span className="text-teal-700 dark:text-[#2DD4BF] font-bold">{counts.reported} civic issues</span> in your neighborhood — <span className="text-emerald-700 dark:text-emerald-400 font-bold">{counts.resolved} resolved</span> by authorities.
          </p>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            “Every report helps your community become safer, cleaner, and more responsive.”
          </p>
        </div>

        {/* Progress Metric & Indicator */}
        <div className="rounded-xl bg-slate-50/80 dark:bg-[#0F1E33] border border-slate-200 dark:border-slate-800 p-4 sm:w-80 shrink-0 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Resolution Progress</span>
            <span className="font-bold text-teal-700 dark:text-[#2DD4BF] font-mono">{resolutionPercentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-[#2DD4BF] rounded-full transition-all duration-500"
              style={{ width: `${resolutionPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {counts.resolved} Resolved
            </span>
            <span>{counts.reported - counts.resolved} In Process</span>
          </div>
        </div>
      </div>
    </div>
  );
};
