import React from 'react';
import { Camera, MapPin, FileText, Send, ArrowRight } from 'lucide-react';

interface ReportingFlowPreviewProps {
  onStartReport: () => void;
}

export const ReportingFlowPreview: React.FC<ReportingFlowPreviewProps> = ({
  onStartReport
}) => {
  const steps = [
    {
      num: '01',
      title: 'Add Photo',
      desc: 'Snap or upload photo of the issue',
      icon: Camera,
      color: '#2563EB',
    },
    {
      num: '02',
      title: 'Confirm Location',
      desc: 'GPS pins the exact spot automatically',
      icon: MapPin,
      color: '#0D9488',
    },
    {
      num: '03',
      title: 'Describe Issue',
      desc: 'Pick category & short description',
      icon: FileText,
      color: '#D97706',
    },
    {
      num: '04',
      title: 'Submit Report',
      desc: 'Routed directly to nodal authority',
      icon: Send,
      color: '#16A34A',
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/40 to-blue-50/60 dark:from-[#0B1E36] dark:to-[#0D243F] border border-teal-200/80 dark:border-slate-800/90 p-5 sm:p-6 shadow-sm transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 rounded-full bg-teal-600 dark:bg-[#2DD4BF]" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Reporting Takes Less Than a Minute</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Simple 4-step process to get civic issues verified and assigned to field crews.
          </p>
        </div>

        <button
          onClick={onStartReport}
          className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white dark:text-[#081220] font-bold text-xs sm:text-sm shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all"
        >
          <span>Start Reporting</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Steps Horizontal / Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="relative rounded-xl bg-white dark:bg-[#091524]/90 border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col justify-between group hover:border-teal-400 dark:hover:border-teal-500/30 transition-colors shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-black text-sm text-teal-700 dark:text-teal-400">
                    {step.num}
                  </span>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}18`, color: step.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-[#2DD4BF] transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {idx < 3 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-400 dark:text-slate-600 font-bold text-xs pointer-events-none">
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
