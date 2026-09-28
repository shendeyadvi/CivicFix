import React from 'react';
import { 
  Home, 
  PlusCircle, 
  ClipboardList, 
  MapPin, 
  User, 
  Bell, 
  ShieldAlert,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

import { AuthService, type UserProfile } from '../../services/authService';

interface MobileNavigationProps {
  activeTab: string;
  currentUser?: UserProfile | null;
  onSelectTab: (tab: string) => void;
  onOpenReport: () => void;
  onOpenNotifications?: () => void;
  onBackToLanding?: () => void;
}

export const MobileHeader: React.FC<MobileNavigationProps> = ({
  currentUser,
  onOpenNotifications,
  onBackToLanding
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#081220]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-2.5">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="p-1.5 -ml-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-md">
          <ShieldAlert className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Civic<span className="text-[#0F766E] dark:text-[#2DD4BF]">Fix</span></span>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
            {currentUser?.isDemo ? 'Demo' : 'Citizen'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0F1E33] dark:hover:bg-[#162846] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0F1E33] dark:hover:bg-[#162846] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] ring-2 ring-white dark:ring-[#081220]" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] dark:to-[#2DD4BF] flex items-center justify-center text-white dark:text-[#081220] font-bold text-xs shadow-xs">
          {AuthService.getInitials(currentUser?.name || 'Citizen User')}
        </div>
      </div>
    </header>
  );
};

export const MobileBottomBar: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenReport
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#081220]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-2 py-2 flex items-center justify-around transition-colors duration-300 shadow-lg">
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
          activeTab === 'home' ? 'text-teal-700 dark:text-[#2DD4BF] font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        onClick={() => onSelectTab('my-reports')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
          activeTab === 'my-reports' ? 'text-teal-700 dark:text-[#2DD4BF] font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <ClipboardList className="w-5 h-5" />
        <span className="text-[10px] font-medium">Reports</span>
      </button>

      {/* Prominent Center Report Button */}
      <button
        onClick={onOpenReport}
        className="-mt-5 flex flex-col items-center group"
        aria-label="Report an issue"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-[#2DD4BF] text-white dark:text-[#081220] flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-[#081220] group-active:scale-95 transition-transform">
          <PlusCircle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold text-teal-700 dark:text-[#2DD4BF] mt-0.5">Report</span>
      </button>

      <button
        onClick={() => onSelectTab('nearby')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
          activeTab === 'nearby' ? 'text-teal-700 dark:text-[#2DD4BF] font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <MapPin className="w-5 h-5" />
        <span className="text-[10px] font-medium">Nearby</span>
      </button>

      <button
        onClick={() => onSelectTab('profile')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
          activeTab === 'profile' ? 'text-teal-700 dark:text-[#2DD4BF] font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </nav>
  );
};
