import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Building,
  UserCheck,
  ThumbsUp,
  ShieldCheck,
  Camera,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { ReportsService, type CivicReportItem } from '../services/reportsService';

interface IssueStatusPreviewProps {
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
}

export const IssueStatusPreview: React.FC<IssueStatusPreviewProps> = ({
  onOpenTrackModal,
}) => {
  const [reports, setReports] = useState<CivicReportItem[]>([]);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number>(0);
  const [upvoted, setUpvoted] = useState<boolean>(false);

  const loadReports = () => {
    const list = ReportsService.getReports();
    setReports(list);
  };

  useEffect(() => {
    loadReports();
    const handleUpdate = () => loadReports();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const currentIssue = reports[selectedIssueIndex] || reports[0] || {
    id: 'rep-seed',
    trackingId: 'CF-2026-10482',
    title: 'Large Pothole on Main Road',
    category: 'Roads & Potholes',
    location: 'MG Road, Camp Area, Pune',
    ward: 'Ward 14 - Camp Zone',
    priority: 'High',
    department: 'Roads & Infrastructure',
    assignedTo: 'Eng. Rajesh Deshmukh',
    status: 'In Progress',
    date: '18 Sep 2026',
    reportedAgo: '4 hours ago',
    citizenName: 'Aarav Deshmukh',
    citizenPhone: '+91 98765 43210',
    description: 'Deep pothole causing traffic slowdown near MG Road signal.',
    lat: 18.5204,
    lng: 73.8567,
    upvotes: 3,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return '#22C55E';
      case 'In Progress':
      case 'Assigned':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  const statusColor = getStatusColor(currentIssue.status);

  return (
    <section id="issue-status" className="py-20 lg:py-28 relative bg-slate-50 dark:bg-[#081220] overflow-hidden transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] glow-teal-radial pointer-events-none rounded-full opacity-40 dark:opacity-100" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] glow-mint-radial pointer-events-none rounded-full opacity-40 dark:opacity-100" />

      <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepTeal-50 dark:bg-[#0F1E33] border border-deepTeal-200 dark:border-deepTeal-700/60 text-deepTeal-800 dark:text-softMint-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
            Live Civic Tracker ({reports.length} Reports Logged)
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Know What’s Happening With Every Report
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Track every inspection, dispatch, and completed fix across Pune in real time.
          </p>
        </div>

        {/* Issue Ticket Switcher Tabs */}
        {reports.length > 0 && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 overflow-x-auto pb-2">
            {reports.map((issue, idx) => {
              const color = getStatusColor(issue.status);
              return (
                <button
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssueIndex(idx);
                    setUpvoted(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                    selectedIssueIndex === idx
                      ? 'bg-deepTeal-600 text-white dark:text-slate-950 font-bold border-deepTeal-500 shadow-md'
                      : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100 dark:bg-[#0F1E33] dark:text-slate-300 dark:hover:text-white dark:border-[#1E355B] dark:hover:bg-[#162846] shadow-sm'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{issue.title.split(' ')[0]} {issue.title.split(' ')[1] || ''}</span>
                  <span className="text-[10px] opacity-75 font-mono">({issue.status})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Realistic CivicFix Issue Card Container */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-white dark:bg-[#0B192C] border-2 border-slate-200 dark:border-[#1E355B] shadow-2xl overflow-hidden">
          
          {/* Card Top Banner */}
          <div className="bg-slate-100 dark:bg-[#0F1E33] px-6 py-4 border-b border-slate-200 dark:border-[#1E355B] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-200 dark:border-deepTeal-700/60 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 text-deepTeal-600 dark:text-deepTeal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-deepTeal-800 bg-deepTeal-50 border border-deepTeal-300 dark:text-softMint-400 dark:bg-[#081220] dark:border-[#162846] px-2.5 py-0.5 rounded">
                    {currentIssue.trackingId}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Public Audit Record</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentIssue.title}
                </h3>
              </div>
            </div>

            {/* Status Badge with Exact Colors */}
            <div className="flex items-center gap-2">
              <div
                className="px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: `${statusColor}22`,
                  color: statusColor,
                  border: `1px solid ${statusColor}66`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-status-pulse"
                  style={{ backgroundColor: statusColor }}
                />
                <span>Status: {currentIssue.status}</span>
              </div>
            </div>
          </div>

          {/* Card Body Details */}
          <div className="p-6 lg:p-8 space-y-8">
            
            {/* Meta Row: Location, Date, Department, Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#162846]">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono mb-0.5 flex items-center gap-1 font-semibold">
                  <MapPin className="w-3 h-3 text-deepTeal-600 dark:text-deepTeal-400" />
                  Location
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={currentIssue.location}>
                  {currentIssue.location}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono mb-0.5 flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Reported Date
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {currentIssue.date}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono mb-0.5 flex items-center gap-1 font-semibold">
                  <Building className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  Concerned Dept.
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={currentIssue.department}>
                  {currentIssue.department}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono mb-0.5 flex items-center gap-1 font-semibold">
                  <UserCheck className="w-3 h-3 text-deepTeal-600 dark:text-deepTeal-400" />
                  Assigned Officer
                </div>
                <div className="text-xs sm:text-sm font-semibold text-deepTeal-700 dark:text-softMint-400 truncate" title={currentIssue.assignedTo || 'Awaiting assignment'}>
                  {currentIssue.assignedTo || 'In Dispatch Queue'}
                </div>
              </div>
            </div>

            {/* Issue Description & Photo Evidence Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Citizen Incident Description
                </h4>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-[#0F1E33]/50 p-4 rounded-xl border border-slate-200 dark:border-[#1E355B]/60">
                  "{currentIssue.description}"
                </p>
                
                {/* Community Upvote & Interaction */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => setUpvoted(!upvoted)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      upvoted
                        ? 'bg-deepTeal-600 text-white dark:text-slate-950 shadow-md'
                        : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300 dark:bg-[#0F1E33] dark:text-slate-300 dark:hover:text-white dark:border-[#1E355B] shadow-sm'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{upvoted ? currentIssue.upvotes + 1 : currentIssue.upvotes} Citizens Confirmed</span>
                  </button>
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
                    AI Geofence Verified
                  </span>
                </div>
              </div>

              {/* Photo Evidence Thumbnail simulation */}
              <div className="md:col-span-4 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#162846] p-4 text-center flex flex-col items-center justify-center min-h-[140px]">
                <div className="w-10 h-10 rounded-full bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-200 dark:border-deepTeal-700 flex items-center justify-center mb-2">
                  <Camera className="w-5 h-5 text-deepTeal-600 dark:text-deepTeal-400" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                  Geo-Tagged Field Photo
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Location verified by GPS
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#1E355B] flex justify-end">
              <button
                onClick={onOpenTrackModal}
                className="px-5 py-2.5 rounded-xl bg-deepTeal-600 hover:bg-deepTeal-500 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Track Ticket Status →
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
