import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

interface TopBarProps {
  onSearch?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <header className="h-16 flex items-center gap-4 px-6 bg-[#081220]/90 backdrop-blur border-b border-[#1E355B]/50 sticky top-0 z-30">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, locations, complaint IDs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1E33] border border-[#1E355B]/60 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#14B8A6]/50 focus:ring-1 focus:ring-[#14B8A6]/20 transition-all"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-xl bg-[#0F1E33] border border-[#1E355B]/60 flex items-center justify-center text-slate-400 hover:text-[#5EEAD4] hover:border-[#14B8A6]/40 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#22C55E] text-[#081220] text-[9px] font-bold flex items-center justify-center">3</span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl bg-[#0F1E33] border border-[#1E355B]/60 hover:border-[#14B8A6]/40 transition-all group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center text-[#081220] font-bold text-xs">
            AS
          </div>
          <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors hidden sm:block">Arjun S.</span>
          <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
