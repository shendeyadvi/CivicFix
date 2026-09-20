import React from 'react';
import { Activity, CheckCircle2, UserCheck, AlertTriangle, Inbox } from 'lucide-react';
import { AUTHORITY_ACTIVITY_LOG } from '../authorityData';

export const AuthorityActivityFeed: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Authority Activity
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 font-mono">Real-time log</span>
      </div>

      <div className="space-y-3">
        {AUTHORITY_ACTIVITY_LOG.map((act) => {
          let Icon = Activity;
          let color = 'text-teal-500 bg-teal-500/10';
          if (act.type === 'assignment') {
            Icon = UserCheck;
            color = 'text-blue-500 bg-blue-500/10';
          } else if (act.type === 'resolution') {
            Icon = CheckCircle2;
            color = 'text-emerald-500 bg-emerald-500/10';
          } else if (act.type === 'incoming') {
            Icon = Inbox;
            color = 'text-sky-500 bg-sky-500/10';
          } else if (act.type === 'overdue') {
            Icon = AlertTriangle;
            color = 'text-red-500 bg-red-500/10';
          }

          return (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-slate-800/80 transition-colors"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {act.text}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 font-medium">
                  {act.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
