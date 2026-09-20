import React from 'react';
import { LayoutDashboard, ClipboardList, Map, Bell, User } from 'lucide-react';
import type { AuthorityTab } from './AuthoritySidebar';

interface AuthorityMobileNavigationProps {
  activeTab: AuthorityTab;
  onSelectTab: (tab: AuthorityTab) => void;
}

export const AuthorityMobileNavigation: React.FC<AuthorityMobileNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'dashboard' as AuthorityTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints' as AuthorityTab, label: 'Complaints', icon: ClipboardList, badge: '7' },
    { id: 'map' as AuthorityTab, label: 'Map', icon: Map },
    { id: 'notifications' as AuthorityTab, label: 'Alerts', icon: Bell, badge: '3' },
    { id: 'profile' as AuthorityTab, label: 'Profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#081220]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2 transition-colors duration-300">
      <div className="grid grid-cols-5 gap-1 text-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors relative ${
                isActive
                  ? 'text-teal-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
              {tab.badge && (
                <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
