import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Users, 
  ArrowRight, 
  ThumbsUp
} from 'lucide-react';
import { ReportsService } from '../../services/reportsService';

interface NearbyIssueItem {
  id: string;
  trackingId: string;
  title: string;
  category: string;
  distance: string;
  peopleAffected: number;
  status: string;
  statusColor: string;
  upvotes: number;
  hasUpvoted?: boolean;
}

interface NearbyIssuesProps {
  onViewAll?: () => void;
  onSelectIssue?: (trackingId: string) => void;
}

export const NearbyIssues: React.FC<NearbyIssuesProps> = ({
  onViewAll,
  onSelectIssue
}) => {
  const [issues, setIssues] = useState<NearbyIssueItem[]>([]);

  const loadIssues = () => {
    const reports = ReportsService.getReports();
    const mapped: NearbyIssueItem[] = reports.map((r, idx) => {
      let statusColor = '#3B82F6';
      if (r.status === 'Resolved' || r.status === 'Closed') statusColor = '#22C55E';
      else if (r.status === 'In Progress' || r.status === 'Assigned') statusColor = '#D97706';

      return {
        id: r.id,
        trackingId: r.trackingId,
        title: r.title,
        category: r.category,
        distance: `${(0.4 + (idx * 0.4)).toFixed(1)} km away`,
        peopleAffected: 5 + (r.upvotes * 3),
        status: r.status,
        statusColor,
        upvotes: r.upvotes,
        hasUpvoted: false
      };
    });
    setIssues(mapped);
  };

  useEffect(() => {
    loadIssues();
    const handleUpdate = () => loadIssues();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIssues(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          hasUpvoted: !item.hasUpvoted,
          upvotes: item.hasUpvoted ? item.upvotes - 1 : item.upvotes + 1,
          peopleAffected: item.hasUpvoted ? item.peopleAffected - 1 : item.peopleAffected + 1,
        };
      }
      return item;
    }));
  };

  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800/90 overflow-hidden flex flex-col shadow-sm transition-colors duration-300">
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-4 rounded-full bg-blue-600 dark:bg-[#3B82F6]" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Nearby Issues</h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-transparent">
            {issues.length} Logged Nearby
          </span>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-bold text-teal-700 dark:text-[#2DD4BF] hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View All Nearby Issues</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {issues.slice(0, 3).map((issue) => {
          return (
            <div
              key={issue.id}
              onClick={() => onSelectIssue && onSelectIssue(issue.trackingId)}
              className="rounded-xl bg-slate-50/80 dark:bg-[#0F1E33] border border-slate-200 dark:border-slate-800/90 hover:border-teal-400 dark:hover:border-slate-700 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Status & Distance Bar */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                    style={{
                      backgroundColor: `${issue.statusColor}18`,
                      color: issue.statusColor,
                      borderColor: `${issue.statusColor}35`
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: issue.statusColor }} />
                    {issue.status}
                  </span>

                  <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    {issue.distance}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-[#2DD4BF] transition-colors leading-snug">
                  {issue.title}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {issue.trackingId} · {issue.category}
                </p>
              </div>

              {/* Bottom Meta & Upvote */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-800 dark:text-slate-300 font-bold">{issue.peopleAffected}</span> affected
                </span>

                <button
                  onClick={(e) => handleUpvote(issue.id, e)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                    issue.hasUpvoted
                      ? 'bg-teal-100 text-teal-800 border border-teal-300 dark:bg-[#0F766E]/30 dark:text-[#2DD4BF] dark:border-teal-500/40'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 dark:border-transparent dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700'
                  }`}
                  title="Upvote to raise civic priority"
                >
                  <ThumbsUp className={`w-3 h-3 ${issue.hasUpvoted ? 'fill-teal-700 dark:fill-[#2DD4BF]' : ''}`} />
                  <span>{issue.upvotes}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
