import React from 'react';
import {
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  ChevronRight,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';

const issues = [
  {
    id: 1,
    title: 'Pothole on MG Road',
    location: 'MG Road, Pune',
    status: 'In Progress',
    statusColor: '#3B82F6',
    statusBg: 'bg-[#3B82F6]/10',
    statusBorder: 'border-[#3B82F6]/25',
    icon: AlertTriangle,
    iconColor: 'text-[#F59E0B]',
    iconBg: 'bg-[#F59E0B]/10',
    trackingId: 'CF-2026-0023',
  },
  {
    id: 2,
    title: 'Broken Street Light',
    location: 'Koregaon Park',
    status: 'Pending',
    statusColor: '#F59E0B',
    statusBg: 'bg-[#F59E0B]/10',
    statusBorder: 'border-[#F59E0B]/25',
    icon: Lightbulb,
    iconColor: 'text-[#A7F3D0]',
    iconBg: 'bg-[#14B8A6]/10',
    trackingId: 'CF-2026-0019',
  },
  {
    id: 3,
    title: 'Garbage Overflow',
    location: 'Camp Area',
    status: 'Resolved',
    statusColor: '#22C55E',
    statusBg: 'bg-[#22C55E]/10',
    statusBorder: 'border-[#22C55E]/25',
    icon: Trash2,
    iconColor: 'text-[#22C55E]',
    iconBg: 'bg-[#22C55E]/10',
    trackingId: 'CF-2026-0011',
  },
  {
    id: 4,
    title: 'Water Leakage',
    location: 'Aundh',
    status: 'In Progress',
    statusColor: '#3B82F6',
    statusBg: 'bg-[#3B82F6]/10',
    statusBorder: 'border-[#3B82F6]/25',
    icon: Droplets,
    iconColor: 'text-[#3B82F6]',
    iconBg: 'bg-[#3B82F6]/10',
    trackingId: 'CF-2026-0029',
  },
];

export const RecentIssues: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#1E355B]/60 bg-[#0A1628] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1E355B]/40">
        <h2 className="text-sm font-bold text-white tracking-tight">Recent Issues</h2>
        <button className="flex items-center gap-1 text-xs text-[#5EEAD4] hover:text-[#A7F3D0] font-medium transition-colors">
          View all
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Issue List */}
      <div className="divide-y divide-[#1E355B]/30">
        {issues.map((issue) => {
          const Icon = issue.icon;
          return (
            <button
              key={issue.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0F1E33]/60 transition-all group"
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl ${issue.iconBg} flex items-center justify-center shrink-0 border border-white/5`}>
                <Icon className={`w-4 h-4 ${issue.iconColor}`} strokeWidth={2} />
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                  {issue.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="text-xs text-slate-500 truncate">{issue.location}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${issue.statusBg} ${issue.statusBorder}`}
                  style={{ color: issue.statusColor }}
                >
                  {issue.status}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
