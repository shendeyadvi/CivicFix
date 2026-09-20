import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, LogOut, Shield, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { AUTHORITY_NOTIFICATIONS } from '../authorityData';

interface AuthorityHeaderProps {
  onSearch?: (query: string) => void;
  onOpenNotifications?: () => void;
  onBackToLanding?: () => void;
}

export const AuthorityHeader: React.FC<AuthorityHeaderProps> = ({
  onSearch,
  onOpenNotifications,
  onBackToLanding,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = AUTHORITY_NOTIFICATIONS.filter((n) => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#081220]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search complaints, locations, complaint IDs..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#162846] transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-teal-700" />
            )}
          </button>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                if (onOpenNotifications) onOpenNotifications();
              }}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#162846] transition-colors"
              aria-label="Authority Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Authority Alerts
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                    {unreadCount} New
                  </span>
                </div>

                <div className="py-2 space-y-2 max-h-80 overflow-y-auto">
                  {AUTHORITY_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        n.type === 'critical'
                          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40'
                          : n.type === 'overdue'
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40'
                          : 'bg-slate-50 dark:bg-[#0F1E33] border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            {n.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-100 dark:bg-[#0F1E33] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-[#162846] transition-colors"
                >
                  Close Notifications
                </button>
              </div>
            )}
          </div>

          {/* Authority Profile Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] hover:bg-slate-200 dark:hover:bg-[#162846] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                AK
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Officer Kulkarni
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  Admin Officer
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-150">
                <div className="p-2 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Officer Kulkarni</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">PMC Central Nodal Officer</p>
                </div>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1E33] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span>Authority Profile</span>
                </button>
                {onBackToLanding && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onBackToLanding();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
