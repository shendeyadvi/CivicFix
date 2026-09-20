import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  PlayCircle,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  Radio,
  Search,
  Maximize2,
  ShieldAlert,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ReportsService, type CivicReportItem } from '../services/reportsService';

interface HeroProps {
  onOpenReportModal: () => void;
  onOpenTrackModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenReportModal, onOpenTrackModal }) => {
  const [reports, setReports] = useState<CivicReportItem[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicReportItem | null>(null);
  const { theme } = useTheme();

  const loadReports = () => {
    const list = ReportsService.getReports();
    setReports(list);
    if (list.length > 0) {
      setSelectedIssue((prev) => (prev && list.some((r) => r.id === prev.id) ? prev : list[0]));
    } else {
      setSelectedIssue(null);
    }
  };

  useEffect(() => {
    loadReports();
    const handleUpdate = () => loadReports();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const getCategoryIcon = (category: string) => {
    if (category.includes('Light')) return <Lightbulb className="w-4 h-4 text-status-warning" />;
    if (category.includes('Waste') || category.includes('Sanitation')) return <Trash2 className="w-4 h-4 text-status-success" />;
    if (category.includes('Water') || category.includes('Drain')) return <Droplets className="w-4 h-4 text-status-info" />;
    if (category.includes('Safety') || category.includes('Infra')) return <ShieldAlert className="w-4 h-4 text-red-500" />;
    return <AlertTriangle className="w-4 h-4 text-status-warning" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return '#22C55E';
      case 'In Progress':
      case 'Assigned':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  // Dynamic Google Map URL based on selected issue in Pune
  const mapEmbedUrl = selectedIssue
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        `${selectedIssue.location}, Pune, Maharashtra`
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=FC+Road+Shivajinagar+Pune&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden civic-grid bg-slate-50 dark:bg-[#081220] transition-colors duration-300"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] glow-teal-radial pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] glow-mint-radial pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-[#081220] to-transparent pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Typography & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepTeal-50 dark:bg-[#0F1E33] border border-deepTeal-200 dark:border-deepTeal-700/60 shadow-sm w-fit mb-6 animate-in fade-in duration-500">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-deepTeal-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-deepTeal-500"></span>
              </span>
              <span className="text-xs font-semibold text-deepTeal-800 dark:text-softMint-300 tracking-wide uppercase">
                Citizen-Driven Public Accountability
              </span>
              <span className="text-slate-300 dark:text-slate-500 text-xs">|</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Pune Municipal Live ({reports.length} Active)</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-6">
              <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Fix Your City.
              </span>
              <br />
              <span className="bg-gradient-to-r from-deepTeal-600 via-deepTeal-500 to-softMint-500 bg-clip-text text-transparent">
                One Report at a Time.
              </span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-xl font-normal">
              CivicFix makes it easy to report civic issues, track their progress in real time, and help build cleaner, safer, better communities with direct municipal accountability in Pune.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <button
                onClick={onOpenReportModal}
                className="group px-7 py-4 rounded-xl bg-gradient-to-r from-deepTeal-600 via-deepTeal-500 to-softMint-400 text-slate-950 font-bold text-base shadow-glow-teal hover:shadow-xl hover:brightness-110 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-center cursor-pointer"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
              </button>

              <a
                href="#how-it-works"
                className="px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm dark:bg-[#0F1E33] dark:hover:bg-[#162846] dark:text-slate-200 dark:hover:text-white dark:border-[#1E355B] font-semibold text-base border hover:border-deepTeal-600/50 transition-all duration-200 flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-deepTeal-600 dark:text-softMint-400" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Quick Live Stats Micro-Bar */}
            <div className="pt-6 border-t border-slate-200 dark:border-[#162846]/80 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  &lt; 30s
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">To Submit Report</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-deepTeal-600 dark:text-softMint-400 tracking-tight">
                  100%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Geotag</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {reports.length} Reports
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Currently Logged</div>
              </div>
            </div>
          </div>

          {/* Right Column: Real Google Map & Civic-Tech Dashboard Visual */}
          <div className="lg:col-span-6 relative">
            {/* Dashboard Container */}
            <div className="relative rounded-2xl bg-white dark:bg-[#0B192C]/90 border border-slate-200 dark:border-[#1E355B] shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-xl">
              
              {/* Dashboard Header Bar */}
              <div className="bg-slate-100 dark:bg-[#0F1E33] px-4 py-3 border-b border-slate-200 dark:border-[#1E355B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-error inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-status-warning inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-status-success inline-block" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 ml-2 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-deepTeal-600 dark:text-softMint-400 animate-pulse" />
                    PMC Live Grid ({reports.length} Reports)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenTrackModal}
                    className="text-[11px] text-deepTeal-800 dark:text-softMint-300 bg-deepTeal-50 dark:bg-deepTeal-950/70 border border-deepTeal-200 dark:border-deepTeal-700/50 px-2 py-0.5 rounded flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Search className="w-3 h-3" />
                    Lookup
                  </button>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-[#081220] px-2 py-0.5 rounded border border-slate-300 dark:border-[#162846]">
                    LIVE GPS
                  </span>
                </div>
              </div>

              {/* Map Location & Issue Selector Pills */}
              {reports.length > 0 && (
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#081220]/90 border-b border-slate-200 dark:border-[#162846] flex items-center gap-2 overflow-x-auto text-xs">
                  {reports.map((issue) => {
                    const statusColor = getStatusColor(issue.status);
                    return (
                      <button
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className={`px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                          selectedIssue?.id === issue.id
                            ? 'bg-deepTeal-600 text-slate-950 border-softMint-400 font-bold shadow-glow-teal'
                            : 'bg-white dark:bg-[#0F1E33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E355B]/60 hover:bg-slate-100 dark:hover:bg-[#162846]'
                        }`}
                      >
                        {getCategoryIcon(issue.category)}
                        <span>{issue.location.split(',')[0]}</span>
                        <span
                          className="w-1.5 h-1.5 rounded-full ml-0.5"
                          style={{ backgroundColor: statusColor }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Real Google Map Embed Container */}
              <div className="relative h-64 sm:h-72 w-full bg-slate-100 dark:bg-[#081220] overflow-hidden">
                <iframe
                  title="Pune Municipal Civic Map"
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    filter:
                      theme === 'dark'
                        ? 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)'
                        : 'none',
                  }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Ambient dark tint gradient over map edges */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/30 dark:from-[#0F1E33] via-transparent to-transparent opacity-60" />

                {/* Real-time Location Indicator Badge */}
                {selectedIssue && (
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#081220]/90 backdrop-blur-md border border-slate-300 dark:border-deepTeal-600/70 rounded-lg px-2.5 py-1.5 flex items-center gap-2 shadow-md z-10 text-xs">
                    <span className="w-2 h-2 rounded-full bg-status-success animate-ping" />
                    <span className="text-slate-900 dark:text-white font-semibold text-[11px]">
                      📍 Pune: {selectedIssue.location.split(',')[0]}
                    </span>
                  </div>
                )}

                {/* Google Map Full View Link */}
                {selectedIssue && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedIssue.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 bg-white/95 dark:bg-[#081220]/90 hover:bg-slate-100 dark:hover:bg-[#162846] text-deepTeal-700 dark:text-softMint-300 border border-slate-300 dark:border-[#1E355B] rounded-lg p-1.5 text-xs flex items-center gap-1 shadow-md z-10 transition-colors"
                    title="Open in Google Maps"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium hidden sm:inline">Google Maps</span>
                  </a>
                )}

                {/* Live Dispatch Badge in bottom-left */}
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0F1E33]/90 backdrop-blur-md border border-slate-200 dark:border-[#1E355B] rounded-lg px-2.5 py-1.5 flex items-center gap-2 shadow-md text-xs pointer-events-none z-10">
                  <span className="w-2 h-2 rounded-full bg-status-warning animate-ping" />
                  <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                    <strong className="text-slate-900 dark:text-white">Live Dispatches:</strong> {reports.length} Reports Logged
                  </span>
                </div>
              </div>

              {/* Selected Issue Preview Card inside Dashboard */}
              {selectedIssue && (
                <div className="p-4 bg-white dark:bg-[#0F1E33] border-t border-slate-200 dark:border-[#1E355B]">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-mono font-bold text-deepTeal-700 dark:text-softMint-400 bg-deepTeal-50 dark:bg-[#081220] border border-deepTeal-200 dark:border-[#162846] px-2 py-0.5 rounded">
                          {selectedIssue.trackingId}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: `${getStatusColor(selectedIssue.status)}22`,
                            color: getStatusColor(selectedIssue.status),
                            border: `1px solid ${getStatusColor(selectedIssue.status)}55`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: getStatusColor(selectedIssue.status) }}
                          />
                          {selectedIssue.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {selectedIssue.title}
                      </h4>
                    </div>

                    <button
                      onClick={onOpenTrackModal}
                      className="px-3 py-1.5 rounded-lg bg-deepTeal-600 hover:bg-deepTeal-500 text-slate-950 font-bold text-xs transition-colors shadow-xs whitespace-nowrap cursor-pointer"
                    >
                      Track Progress →
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                    {selectedIssue.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-[#162846]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-deepTeal-500" />
                      {selectedIssue.location}
                    </span>
                    <span>Reported {selectedIssue.date}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
