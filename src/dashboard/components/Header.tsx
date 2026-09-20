import React, { useState } from 'react';
import { Bell, Search, MapPin, Check, ExternalLink, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  userName?: string;
  wardName?: string;
  onOpenReport?: () => void;
  onOpenTrack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Aarav Deshmukh',
  wardName = 'FC Road / Shivajinagar, Ward 12, Pune',
  onOpenTrack
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const { theme, toggleTheme } = useTheme();

  const notifications = [
    {
      id: 1,
      title: 'Issue Status Updated',
      desc: 'Your report "Broken Streetlight" on Viman Nagar Junction is now In Progress by PMC electrical crew.',
      time: '12m ago',
      unread: true,
      type: 'status',
      trackingId: 'CF-2026-0008'
    },
    {
      id: 2,
      title: 'Civic Crew Dispatched',
      desc: 'Sanitation truck dispatched to clear Mandai Market dump site, Pune.',
      time: '1h ago',
      unread: true,
      type: 'dispatch',
      trackingId: 'CF-2026-0005'
    },
    {
      id: 3,
      title: 'Community Upvote Milestone',
      desc: '14 neighbors upvoted the pothole report near Goodluck Cafe square, FC Road.',
      time: '3h ago',
      unread: false,
      type: 'upvote',
      trackingId: 'CF-2026-0012'
    },
  ];

  return (
    <header className="w-full bg-white/90 dark:bg-[#081220]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 transition-colors duration-300">
      {/* Left side: Friendly Greeting */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Good evening, {userName} <span className="animate-wiggle inline-block">👋</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
          <span>“Let’s make your community a little better today.”</span>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-500/20 ml-1">
            <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            {wardName}
          </span>
        </p>
      </div>

      {/* Right side: Search / Theme Toggle / Notifications / User profile avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-center">
        {/* Quick Search trigger or Track button */}
        <button
          onClick={onOpenTrack}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0F1E33] dark:hover:bg-[#162846] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
          title="Track a report using reference ID"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Track Ticket ID...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-[#081220] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded font-mono shadow-xs">CF-...</kbd>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0F1E33] dark:hover:bg-[#162846] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setUnreadCount(0);
            }}
            className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0F1E33] dark:hover:bg-[#162846] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#0F766E] dark:bg-[#2DD4BF] text-white dark:text-[#081220] text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#081220]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-700/80 shadow-2xl z-50 p-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Live Notifications</h3>
                  <span className="text-[10px] bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-200 dark:border-transparent">Civic Feed</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${n.unread ? 'bg-teal-600 dark:bg-[#2DD4BF]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.desc}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold text-teal-700 dark:text-teal-400">{n.trackingId}</span>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          if (onOpenTrack) onOpenTrack();
                        }}
                        className="text-[11px] font-semibold text-teal-600 dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
                      >
                        Track Status <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" /> Real-time civic push updates active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] dark:to-[#2DD4BF] flex items-center justify-center text-white dark:text-[#081220] font-black text-sm shadow-md">
            {userName.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{userName}</p>
            <p className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">Verified Citizen</p>
          </div>
        </div>
      </div>
    </header>
  );
};
