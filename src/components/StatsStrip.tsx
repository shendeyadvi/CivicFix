import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, CheckCircle2, BarChart3, ArrowUpRight } from 'lucide-react';
import { ReportsService } from '../services/reportsService';

export const StatsStrip: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    resolutionRate: '0%'
  });

  const loadStats = () => {
    const reports = ReportsService.getReports();
    const total = reports.length;
    const inProgress = reports.filter((r) => r.status === 'In Progress').length;
    const resolved = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    const resolutionRate = total > 0 ? `${Math.round((resolved / total) * 100)}%` : '0%';

    setStats({
      total,
      inProgress,
      resolved,
      resolutionRate
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

  const impactData = [
    {
      label: 'Issues Reported',
      value: String(stats.total),
      change: 'Live civic complaints',
      icon: <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
    },
    {
      label: 'In Progress',
      value: String(stats.inProgress),
      change: 'Under active repair',
      icon: <Clock className="w-5 h-5 text-amber-500" />
    },
    {
      label: 'Issues Resolved',
      value: String(stats.resolved),
      change: 'PMC closed tickets',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    },
    {
      label: 'Resolution Rate',
      value: stats.resolutionRate,
      change: 'Platform efficiency',
      icon: <BarChart3 className="w-5 h-5 text-teal-700 dark:text-teal-400" />
    }
  ];

  return (
    <section className="relative z-20 py-8 bg-slate-100 dark:bg-[#0B192C] border-y border-slate-200 dark:border-[#162846]/90 shadow-subtle transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {impactData.map((stat) => (
            <div
              key={stat.label}
              className="relative p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F1E33]/60 border border-slate-200 dark:border-[#1E355B]/40 hover:border-teal-500 transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#162846]">
                  {stat.icon}
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 flex items-center gap-0.5 group-hover:text-teal-600 transition-colors">
                  Live <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
