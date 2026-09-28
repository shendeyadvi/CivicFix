import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PlusCircle, 
  ClipboardList, 
  MapPin, 
  Settings, 
  HelpCircle, 
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ReportsService } from '../../services/reportsService';
import { AuthService, type UserProfile } from '../../services/authService';

interface SidebarProps {
  activeTab: string;
  currentUser?: UserProfile | null;
  onSelectTab: (tab: string) => void;
  onOpenReport: () => void;
  onBackToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  currentUser,
  onSelectTab,
  onOpenReport,
  onBackToLanding
}) => {
  const { theme, toggleTheme } = useTheme();
  const [reportCount, setReportCount] = useState<number>(0);

  const updateCount = () => {
    setReportCount(ReportsService.getReports().length);
  };

  useEffect(() => {
    updateCount();
    const handleUpdate = () => updateCount();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'report', label: 'Report Issue', icon: PlusCircle, isAction: true },
    { id: 'my-reports', label: 'My Reports', icon: ClipboardList, badge: String(reportCount) },
    { id: 'nearby', label: 'Nearby Issues', icon: MapPin, badge: String(reportCount) },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#081220] border-r border-slate-200 dark:border-slate-800/80 h-screen sticky top-0 select-none z-30 transition-colors duration-300">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">Civic<span className="text-[#0F766E] dark:text-[#2DD4BF]">Fix</span></span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">Portal</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Citizen Dashboard</p>
          </div>
        </div>

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            title="Back to Landing Page"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenReport}
                className="w-full flex items-center justify-between px-3.5 py-2.5 my-2 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white dark:text-[#081220] font-bold text-sm shadow-md hover:brightness-110 hover:shadow-teal-900/40 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-white dark:text-[#081220]" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[11px] bg-white/20 dark:bg-[#081220]/20 px-1.5 py-0.5 rounded font-bold">+ New</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-[#2DD4BF] border border-teal-200 dark:border-teal-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700 dark:text-[#2DD4BF]' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-teal-200 text-teal-900 dark:bg-teal-500/20 dark:text-teal-300' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Ward Info Card */}
        <div className="pt-4 px-1">
          <div className="rounded-2xl p-3.5 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-[#0F1E33] dark:to-[#0A1628] border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jurisdiction</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
              {currentUser?.ward || 'Ward 12 · Shivajinagar'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {currentUser?.isDemo ? 'Demo Jurisdiction' : 'Registered Area'}
            </div>
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
              <span>Active Issues:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{reportCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle & Bottom Navigation */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {theme}
          </span>
        </button>

        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* User Profile */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {AuthService.getInitials(currentUser?.name || 'Citizen User')}
            </div>
            <div className="truncate">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {currentUser?.name || 'Citizen User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.isDemo ? 'Demo Citizen' : 'Verified Citizen'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
