import React from 'react';
import { XCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface WhyCivicFixProps {
  onOpenReportModal: () => void;
}

export const WhyCivicFix: React.FC<WhyCivicFixProps> = ({ onOpenReportModal }) => {
  return (
    <section id="why-civicfix" className="py-20 lg:py-28 relative bg-slate-50 dark:bg-[#081220] civic-grid transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepTeal-50 dark:bg-[#0F1E33] border border-deepTeal-200 dark:border-deepTeal-700/60 text-deepTeal-800 dark:text-softMint-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
            The CivicFix Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Why CivicFix?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            See the transformative difference between legacy municipal complaint procedures and CivicFix’s transparent, modern civic-tech system.
          </p>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Left Column: Traditional Reporting */}
          <div className="rounded-3xl bg-white dark:bg-[#0B192C]/80 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-status-error/10 border border-status-error/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-status-error" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-300">
                    Traditional Municipal Reporting
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Legacy paperwork, fragmented portals & silent delays
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'Difficult to know where to report',
                    desc: 'Citizens bounce between multiple municipal desks, websites, and unmonitored hotlines.',
                  },
                  {
                    title: 'Limited visibility',
                    desc: 'Once submitted, complaints vanish into administrative backlogs without public tracking.',
                  },
                  {
                    title: 'Unclear status & zero feedback',
                    desc: 'No way of knowing if an inspector was ever assigned, delayed, or what step was reached.',
                  },
                  {
                    title: 'Hard to follow up',
                    desc: 'Requires repeated physical visits or endless follow-up calls with unclear departmental ownership.',
                  },
                  {
                    title: 'Scattered & duplicated complaints',
                    desc: 'Neighbors file dozens of redundant complaints for the same pothole with zero synergy.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-[#081220]/60 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3"
                  >
                    <XCircle className="w-4 h-4 text-status-error/80 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-500 text-center">
              Results in citizen apathy and unresolved community hazards
            </div>
          </div>

          {/* Right Column: With CivicFix */}
          <div className="rounded-3xl bg-white dark:bg-gradient-to-b dark:from-[#0F1E33] dark:to-[#0B192C] border-2 border-deepTeal-500/80 dark:border-deepTeal-600/80 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-teal-500/5 dark:shadow-card-glow relative">
            
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-deepTeal-600 to-softMint-500 text-white dark:text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow-md">
              Modern Civic Tech Standard
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-deepTeal-800/60">
                <div className="w-10 h-10 rounded-xl bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-300 dark:border-deepTeal-500 flex items-center justify-center shadow-sm dark:shadow-glow-teal">
                  <CheckCircle2 className="w-5 h-5 text-deepTeal-600 dark:text-deepTeal-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>With CivicFix</span>
                    <span className="text-xs text-deepTeal-600 dark:text-softMint-400 font-mono font-bold">100% Transparent</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Direct routing, live stage notifications & verifiable resolution
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'One simple unified platform',
                    desc: 'Submit any civic issue (roads, water, electricity, sanitation) via one fast intuitive interface.',
                  },
                  {
                    title: 'Centralized & geocoded reports',
                    desc: 'All civic issues automatically mapped to exact municipal ward boundaries with EXIF geotags.',
                  },
                  {
                    title: 'Transparent status tracking',
                    desc: 'Live 4-phase tracking: Submitted → Verified → In Progress → Photo-Resolved.',
                  },
                  {
                    title: 'Real-time notifications',
                    desc: 'Instant SMS & web alerts when field crews dispatch work orders or upload resolution proof.',
                  },
                  {
                    title: 'Community visibility & upvotes',
                    desc: 'Public neighborhood feed unites residents to upvote critical safety hazards to top priority.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-deepTeal-700/60 flex items-start gap-3 shadow-sm hover:border-deepTeal-500 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#162846] flex items-center justify-between">
              <span className="text-xs text-deepTeal-700 dark:text-softMint-400 font-bold">
                Active in 120+ Pune residential & municipal wards
              </span>
              <button
                onClick={onOpenReportModal}
                className="text-xs font-bold text-slate-950 bg-deepTeal-400 hover:bg-deepTeal-300 dark:bg-softMint-400 dark:hover:bg-softMint-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
              >
                <span>Try CivicFix</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
