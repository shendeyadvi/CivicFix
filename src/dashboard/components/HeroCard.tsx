import React from 'react';
import { ArrowRight, Trash2, Construction, LampDesk, Droplets, MoreHorizontal } from 'lucide-react';

interface HeroCardProps {
  onReport: () => void;
}

const categories = [
  {
    id: 'cleanliness',
    label: 'Cleanliness',
    desc: 'Keep our city clean',
    icon: Trash2,
    color: 'text-[#22C55E]',
    bg: 'bg-[#22C55E]/10',
    border: 'border-[#22C55E]/20',
    hoverBorder: 'hover:border-[#22C55E]/50',
  },
  {
    id: 'potholes',
    label: 'Potholes',
    desc: 'Fix damaged roads',
    icon: Construction,
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/20',
    hoverBorder: 'hover:border-[#F59E0B]/50',
  },
  {
    id: 'streetlights',
    label: 'Street Lights',
    desc: 'Light up our streets',
    icon: LampDesk,
    color: 'text-[#A7F3D0]',
    bg: 'bg-[#14B8A6]/10',
    border: 'border-[#14B8A6]/20',
    hoverBorder: 'hover:border-[#14B8A6]/50',
  },
  {
    id: 'water',
    label: 'Water Supply',
    desc: 'Ensure clean water',
    icon: Droplets,
    color: 'text-[#3B82F6]',
    bg: 'bg-[#3B82F6]/10',
    border: 'border-[#3B82F6]/20',
    hoverBorder: 'hover:border-[#3B82F6]/50',
  },
  {
    id: 'other',
    label: 'Other Issues',
    desc: 'Report anything else',
    icon: MoreHorizontal,
    color: 'text-slate-300',
    bg: 'bg-slate-700/30',
    border: 'border-slate-700/40',
    hoverBorder: 'hover:border-slate-500/50',
  },
];

export const HeroCard: React.FC<HeroCardProps> = ({ onReport }) => {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-[#1E355B]/60 shadow-xl shadow-black/30 bg-[#0A1628]">
      {/* Hero Image Section */}
      <div
        className="relative h-56 bg-cover bg-center flex flex-col justify-end"
        style={{ backgroundImage: "url('/city-hero.jpg')" }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081220] via-[#081220]/60 to-[#081220]/20" />

        {/* Text content */}
        <div className="relative z-10 px-6 pb-6 pt-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#14B8A6]/20 border border-[#14B8A6]/30 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#5EEAD4] uppercase tracking-wider">Pune — Live Dashboard</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white tracking-tight mb-1">
            Real Issues.
          </h1>
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight mb-3">
            <span className="bg-gradient-to-r from-[#5EEAD4] to-[#A7F3D0] bg-clip-text text-transparent">
              Real Change.
            </span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-sm mb-4">
            Report civic issues, track progress and help build a cleaner, safer, better community.
          </p>
          <button
            onClick={onReport}
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#A7F3D0] hover:bg-[#6EE7B7] text-[#042F2E] font-bold text-sm transition-all duration-200 shadow-lg shadow-teal-900/30 hover:shadow-teal-900/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            Report an Issue
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Issue Category Cards */}
      <div className="grid grid-cols-5 gap-2 p-3 bg-[#0A1628] border-t border-[#1E355B]/40">
        {categories.map(({ id, label, desc, icon: Icon, color, bg, border, hoverBorder }) => (
          <button
            key={id}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border ${border} ${hoverBorder} ${bg} hover:scale-[1.03] hover:shadow-md transition-all duration-200 cursor-pointer group`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} border ${border}`}>
              <Icon className={`w-4 h-4 ${color}`} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 text-center leading-tight">{label}</span>
            <span className="text-[10px] text-slate-500 text-center leading-tight hidden lg:block">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
