import React from 'react';
import { MapPin, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

interface NeedsAttentionProps {
  onActionClick?: (type: string, title: string) => void;
}

export const NeedsAttention: React.FC<NeedsAttentionProps> = ({ onActionClick }) => {
  const items = [
    {
      id: 'na-1',
      badge: 'Critical',
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      title: 'Major water pipeline leakage',
      location: 'Aundh DP Road',
      reportedAgo: '3 hours ago',
      buttonLabel: 'Review',
      buttonClass: 'bg-red-600 hover:bg-red-500 text-white',
    },
    {
      id: 'na-2',
      badge: 'High Priority',
      badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
      title: 'Large pothole near school zone',
      location: 'Shivajinagar FC Road',
      reportedAgo: '3 citizen reports',
      buttonLabel: 'Assign',
      buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white',
    },
    {
      id: 'na-3',
      badge: 'Overdue',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      title: 'Streetlight repair pending',
      location: 'Koregaon Park Lane 7',
      reportedAgo: '2 days overdue',
      buttonLabel: 'Follow Up',
      buttonClass: 'bg-teal-600 hover:bg-teal-500 text-white',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Needs Attention
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          3 Immediate Actions
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeClass}`}
              >
                ● {item.badge}
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.reportedAgo}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {item.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-teal-500" />
                <span>📍 {item.location}</span>
              </div>
            </div>

            <button
              onClick={() => onActionClick && onActionClick(item.buttonLabel, item.title)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${item.buttonClass}`}
            >
              <span>{item.buttonLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
