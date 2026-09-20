import React, { useState } from 'react';
import { Eye, Camera, Compass, CheckCircle2, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';

interface HowItWorksProps {
  onOpenReportModal: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenReportModal }) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1); // Step 2 (Report) by default

  const getStepIcon = (iconName: string, isActive: boolean) => {
    const iconClass = `w-6 h-6 ${
      isActive
        ? 'text-white dark:text-softMint-300'
        : 'text-deepTeal-700 dark:text-deepTeal-400'
    }`;

    switch (iconName) {
      case 'Eye':
        return <Eye className={iconClass} />;
      case 'Camera':
        return <Camera className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={iconClass} />;
      default:
        return <Eye className={iconClass} />;
    }
  };

  return (
    <section id="how-it-works" className="py-20 lg:py-28 relative bg-slate-50 dark:bg-[#081220] overflow-hidden transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] glow-teal-radial pointer-events-none opacity-50 dark:opacity-100" />

      <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepTeal-50 dark:bg-[#0F1E33] border border-deepTeal-200 dark:border-deepTeal-700/60 text-deepTeal-800 dark:text-softMint-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-deepTeal-600 dark:text-deepTeal-400" />
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            From Problem to Solution
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Reporting a civic issue takes only a few simple steps. Here is how your report moves from citizen camera to completed municipal repair in Pune.
          </p>
        </div>

        {/* 4-Step Process Pipeline */}
        <div className="relative mb-16">
          
          {/* Subtle Desktop Connecting Step Bar (positioned cleanly behind icon row) */}
          <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-slate-200 dark:bg-[#1E355B] z-0" />
          <div className="hidden lg:block absolute top-[44px] left-[12%] w-[45%] h-[2px] bg-gradient-to-r from-deepTeal-500 to-softMint-400 z-0 shadow-sm" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {HOW_IT_WORKS_STEPS.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative flex flex-col justify-between ${
                    isActive
                      ? 'bg-white dark:bg-[#0F1E33] border-2 border-deepTeal-500 shadow-xl shadow-teal-500/10 dark:shadow-card-glow transform -translate-y-1.5 ring-4 ring-deepTeal-500/10'
                      : 'bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] hover:border-deepTeal-400 dark:hover:border-deepTeal-500 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Step Number & Icon Row */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-13 h-13 p-3 rounded-xl flex items-center justify-center border transition-all ${
                          isActive
                            ? 'bg-deepTeal-600 dark:bg-deepTeal-600 border-deepTeal-400 shadow-md text-white'
                            : 'bg-slate-100 dark:bg-[#081220] border-slate-200 dark:border-[#1E355B]'
                        }`}
                      >
                        {getStepIcon(step.iconName, isActive)}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
                        isActive 
                          ? 'bg-deepTeal-50 text-deepTeal-800 border-deepTeal-300 dark:bg-deepTeal-950 dark:text-softMint-300 dark:border-deepTeal-700' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#081220] dark:text-slate-400 dark:border-[#162846]'
                      }`}>
                        Step {step.number}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                      {step.title}
                    </h3>

                    {/* Subtitle - High contrast in both light & dark mode */}
                    <p className="text-sm font-semibold text-deepTeal-700 dark:text-softMint-300 mb-3 leading-snug">
                      {step.subtitle}
                    </p>

                    {/* Detail Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>

                  {/* Active Indicator Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#162846] flex items-center justify-between text-xs">
                    <span className={isActive ? 'text-deepTeal-700 dark:text-softMint-300 font-bold flex items-center gap-1.5' : 'text-slate-400 dark:text-slate-500'}>
                      {isActive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-deepTeal-500 animate-pulse" />
                          Selected Step
                        </>
                      ) : (
                        'Click to inspect'
                      )}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono font-medium">
                      Phase {idx + 1}/4
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Step Preview Highlight Banner */}
        <div className="rounded-2xl bg-white dark:bg-gradient-to-r dark:from-[#0B192C] dark:via-[#0F1E33] dark:to-[#0B192C] border border-slate-200 dark:border-[#1E355B] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-200 dark:border-deepTeal-600/50 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-deepTeal-600 dark:text-deepTeal-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Zero Bureaucracy. 100% Digital Citizen Interface.
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                Every report logged generates an immutable audit record and assigns a unique municipal ticket ID, making it impossible for complaints to get lost.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenReportModal}
            className="w-full md:w-auto shrink-0 px-6 py-3 rounded-xl bg-deepTeal-600 hover:bg-deepTeal-500 text-white dark:text-slate-950 font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Start Step 1: Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
