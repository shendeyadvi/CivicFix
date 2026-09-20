import React from 'react';
import {
  FileText,
  MapPin,
  Activity,
  Bell,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { FEATURES } from '../data/mockData';

interface FeaturesProps {
  onOpenReportModal: () => void;
}

export const Features: React.FC<FeaturesProps> = ({ onOpenReportModal }) => {
  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-6 h-6 text-deepTeal-600 dark:text-deepTeal-400" />;
      case 'MapPin':
        return <MapPin className="w-6 h-6 text-deepTeal-600 dark:text-deepTeal-400" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-deepTeal-600 dark:text-deepTeal-400" />;
      case 'Bell':
        return <Bell className="w-6 h-6 text-deepTeal-600 dark:text-deepTeal-400" />;
      case 'Users':
        return <Users className="w-6 h-6 text-deepTeal-600 dark:text-deepTeal-400" />;
      case 'Building2':
        return <Building2 className="w-6 h-6 text-deepTeal-600 dark:text-deepTeal-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-deepTeal-600 dark:text-deepTeal-400" />;
    }
  };

  return (
    <section id="features" className="py-20 lg:py-28 relative bg-white dark:bg-[#060E1A] civic-dots transition-colors duration-300">
      {/* Soft gradient boundary overlays */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-50 dark:from-[#081220] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-[#081220] to-transparent pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepTeal-50 dark:bg-[#0F1E33] border border-deepTeal-200 dark:border-deepTeal-700/60 text-deepTeal-800 dark:text-softMint-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
            Empowering Citizens & Cities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Everything You Need to Make a Difference
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            A comprehensive suite of civic-tech tools designed for effortless reporting, transparent tracking, and automated municipal routing in Pune.
          </p>
        </div>

        {/* 6-Card Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="civic-card rounded-2xl p-7 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top border highlight on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-deepTeal-500/0 group-hover:via-deepTeal-400 to-transparent transition-all duration-300" />

              <div>
                {/* Header Row: Glowing Icon + Feature Tag */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-200 dark:border-deepTeal-700/60 shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:border-deepTeal-500">
                    {getFeatureIcon(feat.icon)}
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 text-deepTeal-800 border-slate-200 dark:bg-[#081220] dark:border-[#162846] dark:text-softMint-300 border">
                    {feat.tag}
                  </span>
                </div>

                {/* Feature Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-deepTeal-600 dark:group-hover:text-deepTeal-400 transition-colors">
                  {feat.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {feat.description}
                </p>
              </div>

              {/* Card Footer Feature Highlights */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#162846] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <Check className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
                  Gov-grade standard
                </span>
                <span className="text-deepTeal-700 dark:text-deepTeal-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Bottom Trust Callout */}
        <div className="mt-14 text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
            Used by neighborhood resident associations, Pune Municipal Corporation, and ward committees.
          </p>
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 text-sm font-semibold text-deepTeal-700 dark:text-softMint-300 hover:text-deepTeal-600 transition-colors underline decoration-deepTeal-500 underline-offset-4"
          >
            <span>Have an issue in mind right now? File a report in 30 seconds</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
