import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';

interface DashboardFooterProps {
  onBackToLanding?: () => void;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({ onBackToLanding }) => {
  return (
    <footer className="mt-8 pt-6 pb-12 sm:pb-8 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 select-none transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Motto */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-2xs">
              <ShieldAlert className="w-3 h-3 text-white" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">Civic<span className="text-[#0F766E] dark:text-[#2DD4BF]">Fix</span></span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">·</span>
          <p className="text-slate-600 dark:text-slate-400">
            “Building better communities through citizen participation and technology.”
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600 dark:text-slate-400 font-medium">
          <button 
            onClick={onBackToLanding}
            className="hover:text-teal-700 dark:hover:text-[#2DD4BF] transition-colors"
          >
            Landing Page
          </button>
          <a href="#about" className="hover:text-teal-700 dark:hover:text-[#2DD4BF] transition-colors">About</a>
          <a href="#privacy" className="hover:text-teal-700 dark:hover:text-[#2DD4BF] transition-colors">Privacy</a>
          <a href="#terms" className="hover:text-teal-700 dark:hover:text-[#2DD4BF] transition-colors">Terms</a>
          <a href="#help" className="hover:text-teal-700 dark:hover:text-[#2DD4BF] transition-colors">Help</a>
          <a href="#contact" className="hover:text-teal-700 dark:hover:text-[#2DD4BF] transition-colors">Contact</a>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 pt-3">
        <span>© 2026 CivicFix Platform. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Designed for civic impact with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
        </span>
      </div>
    </footer>
  );
};
