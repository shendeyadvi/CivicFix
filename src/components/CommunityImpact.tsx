import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Zap,
  CheckCircle,
  Users2,
  HeartHandshake,
  Route,
  Trash,
  LampDesk,
  Waves,
} from 'lucide-react';

interface CommunityImpactProps {
  onOpenReportModal: () => void;
}

export const CommunityImpact: React.FC<CommunityImpactProps> = ({ onOpenReportModal }) => {
  const improvements = [
    {
      title: 'Cleaner Streets',
      metric: '88% Faster Waste Clearance',
      description: 'Illegal dumping and overflowing secondary dumpsters cleared within 24 hours of citizen photo uploads in Pune.',
      icon: <Trash className="w-5 h-5 text-deepTeal-600 dark:text-deepTeal-400" />,
      tag: 'Sanitation',
    },
    {
      title: 'Safer Roads',
      metric: '1,420+ Potholes Patched',
      description: 'Hazardous asphalt craters filled before monsoons, preventing two-wheeler skids and night accidents on arterial roads.',
      icon: <Route className="w-5 h-5 text-deepTeal-600 dark:text-deepTeal-400" />,
      tag: 'Road Safety',
    },
    {
      title: 'Working Streetlights',
      metric: '99.4% Illumination Uptime',
      description: 'Dark alleys and pedestrian school crossings re-lit rapidly, drastically improving nighttime safety for women and children.',
      icon: <LampDesk className="w-5 h-5 text-amber-500" />,
      tag: 'Public Lighting',
    },
    {
      title: 'Better Waste Management',
      metric: '100% Segregation Audited',
      description: 'Neighborhood-level composting and commercial corridor bin schedules synchronized with municipal sanitation trucks.',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      tag: 'Eco Compliance',
    },
    {
      title: 'Faster Issue Resolution',
      metric: '3.2x Accelerated Response',
      description: 'Automated GPS routing cuts out departmental red-tape and assigns field work orders without manual paper delays.',
      icon: <Zap className="w-5 h-5 text-deepTeal-600 dark:text-deepTeal-400" />,
      tag: 'Turnaround Time',
    },
    {
      title: 'Preserved Clean Water',
      metric: '4.8M Litres Saved',
      description: 'Pipeline bursts and mainline valve leakage reported in minutes, preventing contamination and ground erosion.',
      icon: <Waves className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      tag: 'Water Security',
    },
  ];

  return (
    <section id="impact" className="py-20 lg:py-28 relative bg-white dark:bg-[#060E1A] overflow-hidden transition-colors duration-300">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] glow-teal-radial pointer-events-none rounded-full opacity-40 dark:opacity-100" />

      <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepTeal-50 dark:bg-[#0F1E33] border border-deepTeal-200 dark:border-deepTeal-700/60 text-deepTeal-800 dark:text-softMint-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <HeartHandshake className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
            Tangible Neighborhood Transformation
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Better Cities Start With Better Participation.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            When Pune citizens voice local problems and PMC acts on verified data, entire neighborhoods become safer, cleaner, and more resilient.
          </p>
        </div>

        {/* Improvement Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {improvements.map((item) => (
            <div
              key={item.title}
              className="civic-card rounded-2xl p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-200 dark:border-deepTeal-700/60 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#081220] dark:text-slate-400 dark:border-[#162846]">
                    {item.tag}
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-deepTeal-700 dark:text-softMint-400 mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
                  {item.metric}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-deepTeal-600 dark:group-hover:text-deepTeal-400 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-[#162846] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
                  Verified Impact
                </span>
                <span className="text-deepTeal-700 dark:text-deepTeal-400 font-bold flex items-center gap-1">
                  Active Ward Record
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Community Banner & CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-50/70 via-white to-teal-50/70 dark:bg-gradient-to-r dark:from-[#0F1E33] dark:via-[#132238] dark:to-[#0F1E33] border-2 border-deepTeal-200 dark:border-deepTeal-700/60 p-8 sm:p-12 shadow-xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-3">
                <Users2 className="w-5 h-5 text-deepTeal-600 dark:text-deepTeal-400" />
                <span className="text-xs font-bold text-deepTeal-800 dark:text-softMint-300 uppercase tracking-widest font-mono">
                  Join 42,000+ Active Pune Civic Watchers
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                Empower your neighborhood today.
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                You don’t need to wait for months of bureaucratic delays. A single 30-second report puts your complaint directly on the municipal priority dashboard.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <button
                onClick={onOpenReportModal}
                className="px-6 py-4 rounded-xl bg-deepTeal-600 hover:bg-deepTeal-500 text-white dark:text-slate-950 font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Make Your First Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
