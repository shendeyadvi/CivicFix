import React, { useState, useEffect } from 'react';
import {
  Inbox,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { ReportsService } from '../../../services/reportsService';

interface AuthorityStatsProps {
  onSelectFilter?: (statusFilter: string) => void;
}

export const AuthorityStats: React.FC<AuthorityStatsProps> = ({ onSelectFilter }) => {
  const [stats, setStats] = useState({
    total: 0,
    newToday: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
    pendingVerification: 0,
  });

  const loadStats = () => {
    const reports = ReportsService.getReports();
    const total = reports.length;
    const newToday = reports.filter((r) => r.status === 'New').length;
    const inProgress = reports.filter((r) => r.status === 'In Progress').length;
    const resolved = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    const overdue = reports.filter((r) => r.status === 'Overdue').length;
    const pendingVerification = reports.filter((r) => r.status === 'Pending Verification' || r.status === 'Verified').length;

    setStats({
      total,
      newToday,
      inProgress,
      resolved,
      overdue,
      pendingVerification,
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

  const cards = [
    {
      id: 'total',
      label: 'Total Complaints',
      count: String(stats.total),
      subtext: `${stats.total} total reported`,
      icon: Inbox,
      color: '#3B82F6',
      filterValue: 'All',
      borderColor: 'border-blue-500/20',
      bgGlow: 'from-blue-500/10 to-transparent',
    },
    {
      id: 'new',
      label: 'New Today',
      count: String(stats.newToday),
      subtext: 'Received recently',
      icon: AlertCircle,
      color: '#3B82F6',
      filterValue: 'New',
      borderColor: 'border-sky-500/20',
      bgGlow: 'from-sky-500/10 to-transparent',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: String(stats.inProgress),
      subtext: 'Under active repair',
      icon: Clock,
      color: '#F59E0B',
      filterValue: 'In Progress',
      borderColor: 'border-amber-500/20',
      bgGlow: 'from-amber-500/10 to-transparent',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      count: String(stats.resolved),
      subtext: 'Completed tickets',
      icon: CheckCircle2,
      color: '#22C55E',
      filterValue: 'Resolved',
      borderColor: 'border-emerald-500/20',
      bgGlow: 'from-emerald-500/10 to-transparent',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      count: String(stats.overdue),
      subtext: 'Requires action',
      icon: AlertOctagon,
      color: '#EF4444',
      filterValue: 'Overdue',
      borderColor: 'border-red-500/20',
      bgGlow: 'from-red-500/10 to-transparent',
    },
    {
      id: 'pending-verification',
      label: 'Pending Verification',
      count: String(stats.pendingVerification),
      subtext: 'Awaiting triage',
      icon: ShieldCheck,
      color: '#0EA5E9',
      filterValue: 'Pending Verification',
      borderColor: 'border-cyan-500/20',
      bgGlow: 'from-cyan-500/10 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            onClick={() => onSelectFilter && onSelectFilter(c.filterValue)}
            className={`relative p-4 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden ${c.borderColor}`}
          >
            {/* Subtle Gradient Accent background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${c.bgGlow} opacity-30 pointer-events-none`} />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {c.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${c.color}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: c.color }} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {c.count}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1">
              {c.subtext.includes('↑') ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : null}
              <span
                className={`text-[10px] font-medium truncate ${
                  c.subtext.includes('↑')
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : c.id === 'overdue'
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {c.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
