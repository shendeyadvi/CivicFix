import React, { useState, useEffect } from 'react';
import { MapPin, Compass, ExternalLink, Filter, Building2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { ReportsService, type CivicReportItem } from '../../../services/reportsService';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
    case 'High':
      return { text: '#F97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' };
    case 'Medium':
      return { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
    default:
      return { text: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Resolved':
    case 'Closed':
      return { text: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 };
    case 'In Progress':
    case 'Assigned':
      return { text: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', icon: Clock };
    case 'Rejected':
      return { text: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30', icon: AlertTriangle };
    default:
      return { text: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', icon: AlertTriangle };
  }
};

export const JurisdictionMap: React.FC = () => {
  const { theme } = useTheme();
  const [reports, setReports] = useState<CivicReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<CivicReportItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const updateReports = () => {
    const list = ReportsService.getReports();
    if (Array.isArray(list) && list.length > 0) {
      setReports(list);
      setSelectedReport((prev) => (prev && list.some((r) => r.id === prev.id) ? prev : list[0]));
    }
  };

  useEffect(() => {
    // 1. Immediately render cached reports if available
    updateReports();

    // 2. Fetch fresh live reports from PostgreSQL API
    ReportsService.fetchReports()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setReports(list);
          setSelectedReport((prev) => (prev && list.some((r) => r.id === prev.id) ? prev : list[0]));
        }
      })
      .catch((err) => console.warn('Could not fetch reports for JurisdictionMap:', err));

    const handleUpdate = () => updateReports();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchCategory =
      categoryFilter === 'All' || r.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchCategory && matchStatus;
  });

  const activeReport = selectedReport || (filteredReports.length > 0 ? filteredReports[0] : null);

  // Dynamic Google Map centered on selected Pune location
  const mapQuery = activeReport
    ? `${activeReport.location}, Pune, Maharashtra`
    : 'Pune Municipal Corporation, Maharashtra';

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
            Complaints Across Your Jurisdiction ({filteredReports.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Geographic complaint distribution across Pune Municipal Corporation (PMC) wards
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-teal-500" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Road">Roads & Infra</option>
            <option value="Light">Streetlights</option>
            <option value="Waste">Waste & Sanitation</option>
            <option value="Water">Water Supply</option>
            <option value="Drain">Drainage</option>
          </select>
        </div>
      </div>

      {/* Map Surface */}
      <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#EBF3F0] dark:bg-[#071322]">
        <iframe
          title="PMC Pune Jurisdiction Live Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={mapEmbedUrl}
          className="w-full h-full border-0 transition-opacity duration-300"
          style={theme === 'dark' ? { filter: 'invert(90%) hue-rotate(180deg)' } : {}}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Selected Complaint Floating Card Overlay */}
        {activeReport && (
          <div className="absolute top-3 left-3 max-w-[300px] sm:max-w-sm bg-white/95 dark:bg-[#0B192C]/95 backdrop-blur-md border border-slate-200 dark:border-[#1E355B] rounded-2xl p-3.5 shadow-xl z-20 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-emerald-400">
                {activeReport.trackingId}
              </span>
              <div className="flex items-center gap-1.5">
                {(() => {
                  const pColor = getPriorityColor(activeReport.priority);
                  return (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
                      style={{
                        color: pColor.text,
                        backgroundColor: pColor.bg,
                        borderColor: pColor.border,
                      }}
                    >
                      {activeReport.priority}
                    </span>
                  );
                })()}
                {(() => {
                  const sBadge = getStatusBadge(activeReport.status);
                  const SIcon = sBadge.icon;
                  return (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${sBadge.bg} ${sBadge.text}`}>
                      <SIcon className="w-2.5 h-2.5" />
                      {activeReport.status}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {activeReport.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-teal-500 shrink-0" />
                <span className="truncate">{activeReport.location}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {activeReport.department}
              </span>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-teal-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Navigate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Floating Jurisdiction Badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-[#0B192C]/90 backdrop-blur-md border border-slate-200 dark:border-[#1E355B] rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-[11px] font-medium z-20 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-900 dark:text-white font-bold">Pune Central Ward</span>
          <span className="text-slate-400 font-mono text-[10px]">PMC</span>
        </div>
      </div>

      {/* Interactive Location Switcher Strip */}
      {filteredReports.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Focus Location on Map:
            </span>
            <span className="text-[10px] text-slate-500">
              Click any complaint to re-center
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {filteredReports.map((r) => {
              const isSelected = activeReport?.id === r.id;
              const pColor = getPriorityColor(r.priority);
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-[#081220] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500/50 hover:bg-slate-100 dark:hover:bg-[#0F1E33]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : pColor.text }}
                  />
                  <div className="max-w-[160px]">
                    <p className="text-[11px] font-bold truncate leading-tight">{r.title}</p>
                    <p className={`text-[9px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                      {r.location.split(',')[0]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
