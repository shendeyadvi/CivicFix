import React, { useState, useEffect } from 'react';
import { Building2, Clock, AlertCircle } from 'lucide-react';
import { ReportsService } from '../../../services/reportsService';

export const DepartmentPerformance: React.FC = () => {
  const [deptStats, setDeptStats] = useState([
    { name: 'Roads & Infrastructure', resolvedPercent: 0, avgDays: '24 hrs', openCount: 0, color: '#3B82F6' },
    { name: 'Sanitation', resolvedPercent: 0, avgDays: '18 hrs', openCount: 0, color: '#22C55E' },
    { name: 'Water Department', resolvedPercent: 0, avgDays: '12 hrs', openCount: 0, color: '#0EA5E9' },
    { name: 'Electrical', resolvedPercent: 0, avgDays: '20 hrs', openCount: 0, color: '#F59E0B' },
  ]);

  const loadDeptStats = () => {
    const reports = ReportsService.getReports();
    const departments = [
      { name: 'Roads & Infrastructure', color: '#3B82F6', avgDays: '24 hrs' },
      { name: 'Sanitation', color: '#22C55E', avgDays: '18 hrs' },
      { name: 'Water Department', color: '#0EA5E9', avgDays: '12 hrs' },
      { name: 'Electrical', color: '#F59E0B', avgDays: '20 hrs' },
    ];

    const updated = departments.map((d) => {
      const deptReports = reports.filter(
        (r) => r.department === d.name || (d.name.includes('Road') && r.category.includes('Road'))
      );
      const openCount = deptReports.filter((r) => r.status !== 'Resolved' && r.status !== 'Closed').length;
      const resolvedCount = deptReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
      const resolvedPercent = deptReports.length > 0 ? Math.round((resolvedCount / deptReports.length) * 100) : 0;

      return {
        ...d,
        openCount,
        resolvedPercent,
      };
    });

    setDeptStats(updated);
  };

  useEffect(() => {
    loadDeptStats();
    const handleUpdate = () => loadDeptStats();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
            Department Performance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Operational SLA resolution rates and open complaints calculated from live ticket queue
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {deptStats.map((dept) => (
          <div
            key={dept.name}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {dept.name}
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Target SLA: <strong className="text-slate-700 dark:text-slate-200">{dept.avgDays}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    Open: <strong className="text-amber-600 dark:text-amber-400">{dept.openCount} complaints</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {dept.resolvedPercent}%
                </span>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  SLA Resolved
                </span>
              </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${dept.resolvedPercent}%`,
                  backgroundColor: dept.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
