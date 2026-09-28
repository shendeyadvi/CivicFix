import React, { useState, useEffect } from 'react';
import { Menu, X, UserCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenReportModal?: () => void;
  onOpenTrackModal?: () => void;
  onOpenLoginModal: () => void;
  onNavigateToDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLoginModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Issue Status', href: '#issue-status' },
    { label: 'Impact', href: '#impact' },
    { label: 'Why CivicFix', href: '#why-civicfix' },
  ];

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const homeElement = document.getElementById('home');
    if (homeElement) {
      homeElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#081220]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 py-3 shadow-md dark:shadow-lg'
          : 'bg-white/80 dark:bg-[#081220]/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/40 py-4 sm:py-5'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={handleHomeClick}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-deepTeal-500 rounded-lg p-1"
            aria-label="CivicFix Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deepTeal-700 via-deepTeal-600 to-softMint-400 p-[1px] shadow-glow-teal flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-white dark:bg-[#081220] rounded-[11px] flex items-center justify-center">
                {/* Custom Civic Fix Badge Icon */}
                <svg
                  className="w-5 h-5 text-deepTeal-600 dark:text-softMint-300 transition-transform group-hover:rotate-12 duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  <circle cx="18.5" cy="5.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                Civic<span className="text-deepTeal-600 dark:text-softMint-400">Fix</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 tracking-wider uppercase font-medium">
                Public Infrastructure
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={link.href === '#home' ? handleHomeClick : undefined}
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-deepTeal-600 dark:hover:text-[#2DD4BF] hover:bg-slate-100 dark:hover:bg-[#0F1E33] rounded-lg transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0F1E33] dark:hover:bg-[#162846] border border-slate-300 dark:border-[#1E355B] text-slate-700 dark:text-softMint-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-deepTeal-500"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-status-warning" />
              ) : (
                <Moon className="w-4 h-4 text-deepTeal-700" />
              )}
            </button>

            {/* Login Button */}
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0F1E33] rounded-lg transition-colors border border-transparent hover:border-slate-300 dark:hover:border-[#1E355B] flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-deepTeal-600 dark:text-sageGreen-400" />
              <span>Login</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0F1E33] border border-slate-300 dark:border-[#1E355B] text-slate-700 dark:text-slate-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-status-warning" />
              ) : (
                <Moon className="w-4 h-4 text-deepTeal-700" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-[#0F1E33] border border-slate-300 dark:border-[#1E355B] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-deepTeal-500"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 dark:bg-[#081220]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.href === '#home') {
                    handleHomeClick(e);
                  }
                }}
                className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-deepTeal-600 dark:hover:text-softMint-300 hover:bg-slate-100 dark:hover:bg-[#0F1E33] rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-100 dark:bg-[#0F1E33] border border-slate-300 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 text-sm font-medium flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-deepTeal-600 dark:text-sageGreen-400" />
                Citizen & Official Login
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
