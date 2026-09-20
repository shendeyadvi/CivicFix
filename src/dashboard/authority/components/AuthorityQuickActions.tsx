import React from 'react';
import {
  ClipboardCheck,
  UserPlus,
  Edit3,
  MapPin,
  Download,
  Building2
} from 'lucide-react';
import type { AuthorityTab } from './AuthoritySidebar';

interface AuthorityQuickActionsProps {
  onSelectTab: (tab: AuthorityTab) => void;
}

export const AuthorityQuickActions: React.FC<AuthorityQuickActionsProps> = ({
  onSelectTab,
}) => {
  const actions = [
    {
      label: 'Review New Complaints',
      desc: '7 active complaints',
      icon: ClipboardCheck,
      tab: 'complaints' as AuthorityTab,
      color: '#3B82F6',
    },
    {
      label: 'Assign Department',
      desc: 'Dispatch crew teams',
      icon: UserPlus,
      tab: 'assignments' as AuthorityTab,
      color: '#F59E0B',
    },
    {
      label: 'Update Complaint Status',
      desc: 'Mark resolved / in progress',
      icon: Edit3,
      tab: 'complaints' as AuthorityTab,
      color: '#22C55E',
    },
    {
      label: 'View Jurisdiction Map',
      desc: 'PMC ward boundaries',
      icon: MapPin,
      tab: 'map' as AuthorityTab,
      color: '#A855F7',
    },
    {
      label: 'Export Operational Report',
      desc: 'Download CSV / PDF summary',
      icon: Download,
      action: () => alert('Generating PMC Municipal Weekly Performance CSV Report...'),
      color: '#0EA5E9',
    },
    {
      label: 'Manage Departments',
      desc: 'View SLA & workforce',
      icon: Building2,
      tab: 'departments' as AuthorityTab,
      color: '#10B981',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Quick Actions
        </h3>
        <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-emerald-400">
          Authority Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              onClick={() => {
                if (act.action) {
                  act.action();
                } else if (act.tab) {
                  onSelectTab(act.tab);
                }
              }}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-slate-100 dark:hover:bg-[#0F1E33] transition-all text-left group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${act.color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color: act.color }} />
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {act.label}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {act.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
