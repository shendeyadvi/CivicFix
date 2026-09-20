import React from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const stats = [
  {
    label: 'Total Reports',
    value: '38',
    icon: FileText,
    color: '#5EEAD4',
    bg: 'bg-[#14B8A6]/10',
    border: 'border-[#14B8A6]/20',
    glow: 'shadow-[0_0_10px_-4px_rgba(20,184,166,0.4)]',
  },
  {
    label: 'Resolved',
    value: '27',
    icon: CheckCircle2,
    color: '#22C55E',
    bg: 'bg-[#22C55E]/10',
    border: 'border-[#22C55E]/20',
    glow: 'shadow-[0_0_10px_-4px_rgba(34,197,94,0.3)]',
  },
  {
    label: 'In Progress',
    value: '7',
    icon: Clock,
    color: '#3B82F6',
    bg: 'bg-[#3B82F6]/10',
    border: 'border-[#3B82F6]/20',
    glow: 'shadow-[0_0_10px_-4px_rgba(59,130,246,0.3)]',
  },
  {
    label: 'Pending',
    value: '4',
    icon: AlertCircle,
    color: '#F59E0B',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/20',
    glow: 'shadow-[0_0_10px_-4px_rgba(245,158,11,0.3)]',
  },
];

export const QuickStats: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#1E355B]/60 bg-[#0A1628] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#1E355B]/40">
        <h2 className="text-sm font-bold text-white tracking-tight">Quick Stats</h2>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {stats.map(({ label, value, icon: Icon, color, bg, border, glow }) => (
          <div
            key={label}
            className={`flex items-center gap-3 p-3 rounded-xl border ${border} ${bg} ${glow} transition-all hover:scale-[1.02]`}
          >
            <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0`}>
              <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
            </div>
            <div>
              <div className="text-lg font-extrabold leading-none" style={{ color }}>
                {value}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
