import React from 'react';
import { 
  CheckCircle2, 
  Users, 
  Clock, 
  Radio
} from 'lucide-react';

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

const ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    headline: 'A civic issue was resolved',
    detail: 'Streetlight repaired near Shivajinagar & FC Road intersection, Pune.',
    category: 'Street Lighting',
    timestamp: '12 min ago',
    statusBadge: 'Resolved',
    statusColor: '#16A34A',
    icon: CheckCircle2,
  },
  {
    id: 'act-2',
    headline: '15 citizens reported a road issue',
    detail: 'Large pothole reported near Goodluck Cafe square, FC Road, Pune.',
    category: 'Roads & Potholes',
    timestamp: '35 min ago',
    statusBadge: 'Community Report',
    statusColor: '#2563EB',
    icon: Users,
  },
  {
    id: 'act-3',
    headline: 'Waste collection issue updated',
    detail: 'Special cleaning truck collection scheduled for Mandai Market tomorrow 8:00 AM.',
    category: 'Sanitation',
    timestamp: '1 hr ago',
    statusBadge: 'Scheduled',
    statusColor: '#D97706',
    icon: Clock,
  },
  {
    id: 'act-4',
    headline: 'Water supply pipeline fixed',
    detail: 'Repaired main distribution valve leak near Karve Statue, Kothrud, Pune.',
    category: 'Water & Drainage',
    timestamp: '3 hrs ago',
    statusBadge: 'Resolved',
    statusColor: '#16A34A',
    icon: CheckCircle2,
  }
];

export const ActivityFeed: React.FC = () => {
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
        {ACTIVITIES.map((act) => {
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
        })}
      </div>
    </div>
  );
};
