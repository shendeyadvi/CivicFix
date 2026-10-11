import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Users, 
  Clock, 
  Radio
} from 'lucide-react';
import { ReportsService, type CivicReportItem } from '../../services/reportsService';

interface ActivityItem {
  id: string;
  headline: string;
  detail: string;
  category: string;
  timestamp: string;
  statusBadge: string;
  statusColor: string;
  icon: React.ElementType;
}

export const ActivityFeed: React.FC = () => {
  const [reports, setReports] = useState<CivicReportItem[]>([]);

  const loadActivities = () => {
    setReports(ReportsService.getReports());
  };

  useEffect(() => {
    loadActivities();
    const handleUpdate = () => loadActivities();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const activities: ActivityItem[] = reports.slice(0, 6).map((r) => {
    let headline = `New civic report submitted (${r.trackingId})`;
    let statusBadge = 'Community Report';
    let statusColor = '#2563EB';
    let icon = Users;

    if (r.status === 'Resolved' || r.status === 'Closed') {
      headline = `Civic issue resolved (${r.trackingId})`;
      statusBadge = 'Resolved';
      statusColor = '#16A34A';
      icon = CheckCircle2;
    } else if (r.status === 'In Progress' || r.status === 'Assigned') {
      headline = `Work in progress (${r.trackingId})`;
      statusBadge = r.status;
      statusColor = '#D97706';
      icon = Clock;
    }

    return {
      id: r.id,
      headline,
      detail: `${r.title} — ${r.location}`,
      category: r.category,
      timestamp: r.reportedAgo || r.date,
      statusBadge,
      statusColor,
      icon,
    };
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800/90 overflow-hidden flex flex-col shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-4 rounded-full bg-emerald-600 dark:bg-[#10B981]" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Community Activity</h3>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/20">
            <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600 dark:text-emerald-400" />
            Live Feed
          </span>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Verified civic events
        </span>
      </div>

      {/* Activity items list */}
      <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
        {activities.length > 0 ? (
          activities.map((act) => {
            const Icon = act.icon;
            return (
              <div 
                key={act.id} 
                className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5 hover:bg-slate-50 dark:hover:bg-[#0F1E33] px-2 rounded-xl transition-colors"
              >
                {/* Icon */}
                <div 
                  className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border mt-0.5"
                  style={{
                    backgroundColor: `${act.statusColor}18`,
                    borderColor: `${act.statusColor}35`,
                    color: act.statusColor,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {act.headline}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium">
                    “{act.detail}”
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span 
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full border"
                      style={{
                        backgroundColor: `${act.statusColor}18`,
                        color: act.statusColor,
                        borderColor: `${act.statusColor}35`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: act.statusColor }} />
                      {act.statusBadge}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {act.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No community activity yet. Be the first citizen to report an issue in your neighborhood.
          </div>
        )}
      </div>
    </div>
  );
};
