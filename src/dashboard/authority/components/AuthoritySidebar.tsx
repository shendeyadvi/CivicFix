import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  Users,
  Building2,
  Bell,
  User,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  type LucideIcon
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export type AuthorityTab =
  | 'dashboard'
  | 'complaints'
  | 'map'
  | 'assignments'
  | 'departments'
  | 'notifications'
  | 'profile';

interface NavItem {
  id: AuthorityTab;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface AuthoritySidebarProps {
  activeTab: AuthorityTab;
  onSelectTab: (tab: AuthorityTab) => void;
  onBackToLanding?: () => void;
}

export const AuthoritySidebar: React.FC<AuthoritySidebarProps> = ({
  activeTab,
  onSelectTab,
  onBackToLanding,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints', icon: ClipboardList, badge: '7' },
    { id: 'map', label: 'Issue Map', icon: Map },
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#060E1A] border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-screen sticky top-0 select-none z-30 transition-colors duration-300">
      {/* Logo & Portal Badge */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 p-[1px] shadow-glow-teal flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-[#081220] rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Civic<span className="text-teal-600 dark:text-emerald-400">Fix</span>
              </span>
            </div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Authority Portal
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Municipal Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-teal-600 text-white dark:bg-teal-500/15 dark:text-emerald-300 dark:border dark:border-teal-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0F1E33] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-white dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-emerald-400/20 dark:text-emerald-300'
                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-emerald-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Preferences
        </div>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0F1E33] transition-colors"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-teal-700" />
            )}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0F1E33] transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => alert('CivicFix Authority Support Hotline: 1800-233-0123')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0F1E33] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Help & Support</span>
        </button>
      </div>

      {/* Footer Profile & Landing Exit */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#081220] space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0F1E33] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              AK
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Officer Kulkarni
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                PMC Nodal Officer
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="w-full py-2 px-3 rounded-lg bg-slate-200/80 dark:bg-[#162846] text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-2 hover:bg-slate-300 dark:hover:bg-[#1E355B] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Exit Authority Portal</span>
          </button>
        )}

        <div className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-mono tracking-tight pt-1">
          Authority Portal — Serving Better Communities
        </div>
      </div>
    </aside>
  );
};
