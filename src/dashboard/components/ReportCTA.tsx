import React from 'react';
import { PlusCircle, ClipboardList, Camera, MapPin, Zap, ShieldCheck } from 'lucide-react';

interface ReportCTAProps {
  onOpenReport: () => void;
  onViewMyReports?: () => void;
}

export const ReportCTA: React.FC<ReportCTAProps> = ({
  onOpenReport,
  onViewMyReports
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50/90 via-emerald-50/50 to-white dark:from-[#0B1E36] dark:via-[#0D243F] dark:to-[#081729] border border-teal-200/80 dark:border-teal-500/30 p-6 sm:p-7 shadow-lg dark:shadow-xl dark:shadow-teal-950/40 group transition-colors duration-300">
      {/* Background Decorative Radial Gradient */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/15 transition-all duration-500" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #0F766E 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 dark:bg-teal-500/10 border border-teal-300/80 dark:border-teal-500/30 text-teal-800 dark:text-[#2DD4BF] text-xs font-bold mb-3 shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-teal-700 dark:fill-[#2DD4BF] text-teal-700 dark:text-[#2DD4BF]" />
            <span>Average Municipal Dispatch: &lt; 3 Hours</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            See a problem? <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-[#14B8A6] dark:from-[#2DD4BF] dark:to-[#A7F3D0]">Report it.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-2 leading-relaxed font-normal">
            Help your community by reporting potholes, garbage, broken streetlights, water leaks, and other civic issues. Every ticket is geo-tagged and directly routed to municipal engineers.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-teal-600 dark:text-[#2DD4BF]" /> Photo verification
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-[#2DD4BF]" /> Exact GPS tagging
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-[#2DD4BF]" /> Transparent tracking
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={onOpenReport}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-[#2DD4BF] text-white dark:text-[#081220] font-extrabold text-sm sm:text-base shadow-lg shadow-teal-900/20 dark:shadow-teal-900/50 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ring-2 ring-teal-400/30"
            aria-label="Report an issue"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <span>+ Report an Issue</span>
          </button>

          <button
            onClick={onViewMyReports}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/90 dark:bg-[#0F1E33]/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-xs transition-all duration-200"
          >
            <ClipboardList className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>View My Reports</span>
          </button>
        </div>
      </div>
    </section>
  );
};
