import React from 'react';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
  onOpenLoginModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenReportModal,
  onOpenTrackModal,
  onOpenLoginModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 dark:bg-[#060E1A] border-t border-slate-800 dark:border-[#162846] text-slate-400 relative z-10 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          
          {/* Brand & Mission (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#home" className="flex items-center gap-3 w-fit group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-deepTeal-700 via-deepTeal-600 to-softMint-400 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#081220] rounded-[11px] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-softMint-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center">
                Civic<span className="text-softMint-400">Fix</span>
              </span>
            </a>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              “Building better communities through citizen participation and technology in Pune.”
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Connecting citizens, neighborhood residents, and Pune Municipal Corporation (PMC) for transparent public infrastructure maintenance.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { name: 'X / Twitter', icon: '𝕏', href: '#' },
                { name: 'GitHub', icon: 'GH', href: '#' },
                { name: 'LinkedIn', icon: 'in', href: '#' },
                { name: 'PMC Portal', icon: '🏛️', href: '#' },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="w-8 h-8 rounded-lg bg-[#0F1E33] border border-[#1E355B] text-slate-300 hover:text-softMint-300 hover:border-deepTeal-500 flex items-center justify-center text-xs font-mono font-bold transition-all"
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={onOpenReportModal}
                  className="hover:text-softMint-300 transition-colors text-left"
                >
                  Report an Issue
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrackModal}
                  className="hover:text-softMint-300 transition-colors text-left"
                >
                  Track Reports
                </button>
              </li>
              <li>
                <a href="#impact" className="hover:text-softMint-300 transition-colors">
                  Community Feed
                </a>
              </li>
              <li>
                <a href="#issue-status" className="hover:text-softMint-300 transition-colors">
                  Live Status Showcase
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenLoginModal}
                  className="hover:text-softMint-300 transition-colors text-left"
                >
                  Municipal Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
              Company & PMC
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#why-civicfix" className="hover:text-softMint-300 transition-colors">
                  About CivicFix
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-softMint-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-softMint-300 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-softMint-300 transition-colors">
                  Contact PMC Authorities
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-softMint-300 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-softMint-300 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Contact & Escalation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
              Pune Civic Helplines
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#081220] border border-[#162846]">
                <div className="text-slate-400 font-mono">Emergency Public Safety</div>
                <div className="text-white font-bold text-sm mt-0.5">Dial 112 / 100</div>
              </div>
              <div className="p-3 rounded-xl bg-[#081220] border border-[#162846]">
                <div className="text-slate-400 font-mono">PMC Municipal Toll-Free</div>
                <div className="text-white font-bold text-sm mt-0.5">1800-1030-222</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-400 text-center sm:text-left">
            <strong className="text-slate-300">© 2026 CivicFix.</strong> Building better cities together in Pune.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-500">Citizen Data Protection Standard • ISO 27001</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-[#0F1E33] border border-[#1E355B] text-slate-300 hover:text-white hover:border-deepTeal-500 transition-colors flex items-center gap-1.5"
              title="Scroll to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-softMint-400" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
