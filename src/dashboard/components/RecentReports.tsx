import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Trash2, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ArrowRight,
  PlusCircle,
  Droplets,
  ShieldAlert
} from 'lucide-react';
import { ReportsService, type CivicReportItem } from '../../services/reportsService';

interface RecentReportsProps {
  onViewAll?: () => void;
  onSelectReport?: (trackingId: string) => void;
  onOpenReport?: () => void;
}

export const RecentReports: React.FC<RecentReportsProps> = ({
  onViewAll,
  onSelectReport,
  onOpenReport
}) => {
  const [reportsList, setReportsList] = useState<CivicReportItem[]>([]);

  const loadReports = () => {
    setReportsList(ReportsService.getReports());
  };

  useEffect(() => {
    loadReports();
    const handleUpdate = () => loadReports();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete report "${title}"?`)) {
      ReportsService.deleteReport(id);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Light')) return Lightbulb;
    if (category.includes('Waste') || category.includes('Sanitation')) return Trash2;
    if (category.includes('Water') || category.includes('Drain')) return Droplets;
    if (category.includes('Safety') || category.includes('Cable')) return ShieldAlert;
    return AlertTriangle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return '#22C55E';
      case 'In Progress':
      case 'Assigned':
        return '#D97706';
      case 'New':
      case 'Pending Verification':
        return '#3B82F6';
      default:
        return '#3B82F6';
    }
  };

  if (!reportsList || reportsList.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-[#2DD4BF] flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No active civic reports found.</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Spotted something that needs attention? Submit a new report with 1-tap AI photo analysis.
        </p>
        <button
          onClick={onOpenReport}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white dark:text-[#081220] font-bold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Report an Issue →
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800/90 overflow-hidden flex flex-col shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-4 rounded-full bg-teal-600 dark:bg-[#2DD4BF]" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Reports</h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-transparent">
            {reportsList.length} Total
          </span>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-bold text-teal-700 dark:text-[#2DD4BF] hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-5">Issue / Category</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Reported Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
            {reportsList.map((item) => {
              const Icon = getCategoryIcon(item.category);
              const statusColor = getStatusColor(item.status);

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectReport && onSelectReport(item.trackingId)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-[#2DD4BF] transition-colors flex items-center gap-1.5">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {item.trackingId} · {item.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                      style={{
                        backgroundColor: `${statusColor}18`,
                        color: statusColor,
                        borderColor: `${statusColor}35`
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => handleDelete(e, item.id, item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:text-teal-700 dark:group-hover:text-white group-hover:bg-teal-50 dark:group-hover:bg-[#0F766E]/30 transition-colors">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        {reportsList.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const statusColor = getStatusColor(item.status);

          return (
            <div
              key={item.id}
              onClick={() => onSelectReport && onSelectReport(item.trackingId)}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{item.trackingId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0"
                    style={{
                      backgroundColor: `${statusColor}18`,
                      color: statusColor,
                      borderColor: `${statusColor}35`
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                    {item.status}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, item.id, item.title)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">{item.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
