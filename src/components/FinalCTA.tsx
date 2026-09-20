import React from 'react';
import { ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface FinalCTAProps {
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenReportModal, onOpenTrackModal }) => {
  return (
    <section className="py-20 lg:py-28 relative bg-slate-100 dark:bg-[#081220] overflow-hidden transition-colors duration-300">
      {/* Subtle Teal/Mint ambient glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] glow-teal-radial pointer-events-none rounded-full opacity-30 dark:opacity-100" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] glow-mint-radial pointer-events-none rounded-full opacity-30 dark:opacity-100" />

      <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
        
        <div className="rounded-3xl bg-white dark:bg-gradient-to-b dark:from-[#0F1E33] dark:via-[#0B192C] dark:to-[#081220] border-2 border-slate-200 dark:border-deepTeal-600/60 p-8 sm:p-14 text-center shadow-2xl shadow-slate-300/60 dark:shadow-deepTeal-950/50 relative overflow-hidden">
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 civic-grid opacity-20 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepTeal-50 dark:bg-[#081220] border border-deepTeal-200 dark:border-deepTeal-700 text-deepTeal-800 dark:text-softMint-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
              Make Your Community Better Today
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
              See a Problem?{' '}
              <span className="text-deepTeal-700 dark:bg-gradient-to-r dark:from-deepTeal-400 dark:via-deepTeal-300 dark:to-softMint-300 dark:bg-clip-text dark:text-transparent">
                Help Fix It.
              </span>
            </h2>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
              Your report could be the first step toward making your neighborhood cleaner, safer, and better. Join thousands of active citizens making real municipal impact in Pune.
            </p>

            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onOpenReportModal}
                className="w-full sm:w-auto group px-8 py-4 rounded-xl bg-deepTeal-600 hover:bg-deepTeal-500 text-white dark:text-slate-950 font-bold text-base shadow-lg shadow-teal-600/20 hover:shadow-xl hover:brightness-105 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-center"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Report an Issue</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenTrackModal}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 dark:bg-[#081220] dark:hover:bg-[#162846] dark:text-slate-200 dark:border-[#1E355B] font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 text-center shadow-sm"
              >
                <span>Explore CivicFix Tracker</span>
              </button>
            </div>

            {/* Trust Metrics Pill */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-status-success" />
                No registration required to report
              </span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-status-success" />
                Direct Municipal Integration
              </span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-status-success" />
                100% Free & Open
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
