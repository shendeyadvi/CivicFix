import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Layers } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ReportsService } from '../../services/reportsService';

interface MapIssuePin {
  id: string;
  trackingId: string;
  title: string;
  category: string;
  location: string;
  mapQuery: string;
  status: string;
  color: string;
}

interface IssueMapProps {
  onExploreMap?: () => void;
  onSelectIssue?: (trackingId: string) => void;
}

export const IssueMap: React.FC<IssueMapProps> = ({
  onSelectIssue
}) => {
  const { theme } = useTheme();
  const [pins, setPins] = useState<MapIssuePin[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapIssuePin | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const loadPins = () => {
    const reports = ReportsService.getReports();
    const mappedPins: MapIssuePin[] = reports.map((r) => {
      let color = '#3B82F6';
      if (r.category.includes('Road')) color = '#D97706';
      else if (r.category.includes('Light')) color = '#CA8A04';
      else if (r.category.includes('Waste') || r.category.includes('Sanitation')) color = '#16A34A';
      else if (r.category.includes('Water') || r.category.includes('Drain')) color = '#2563EB';
      else if (r.category.includes('Safety') || r.category.includes('Infra')) color = '#DC2626';

      return {
        id: r.id,
        trackingId: r.trackingId,
        title: r.title,
        category: r.category,
        location: r.location,
        mapQuery: `${r.location}, Pune, Maharashtra`,
        status: r.status,
        color,
      };
    });

    setPins(mappedPins);
    if (mappedPins.length > 0) {
      setSelectedPin((prev) => (prev && mappedPins.some((p) => p.id === prev.id) ? prev : mappedPins[0]));
    } else {
      setSelectedPin(null);
    }
  };

  useEffect(() => {
    loadPins();
    const handleUpdate = () => loadPins();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const filteredPins = filter === 'All' 
    ? pins 
    : pins.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()));

  // Dynamic Google Map URL centered on selected Pune location
  const mapEmbedUrl = selectedPin
    ? `https://maps.google.com/maps?q=${encodeURIComponent(selectedPin.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=FC+Road+Shivajinagar+Pune&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800/90 overflow-hidden flex flex-col shadow-sm transition-colors duration-300">
      {/* Header with Title and Map Controls */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#0D1E33]/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 rounded-full bg-teal-600 dark:bg-[#14B8A6]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Issues Around You</h3>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-500/20">
              Pune Live Map ({pins.length})
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Real Google Map view of reported civic issues across Pune municipal wards.
          </p>
        </div>

        {selectedPin && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(selectedPin.mapQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 text-teal-700 dark:text-[#2DD4BF] border border-teal-200 dark:border-teal-500/30 flex items-center gap-1.5 transition-all group shadow-2xs"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}
      </div>

      {/* Real Google Map Embed Container */}
      <div className="relative w-full h-[320px] sm:h-[360px] bg-slate-100 dark:bg-[#07111E] overflow-hidden">
        {/* Google Map iframe */}
        <iframe
          title="CivicFix Pune Live Map"
          src={mapEmbedUrl}
          className="w-full h-full border-0"
          style={theme === 'dark' ? { filter: 'invert(90%) hue-rotate(180deg)' } : {}}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Floating Active Issue Overlay Card on Map */}
        {selectedPin && (
          <div className="absolute top-3 left-3 max-w-[260px] sm:max-w-xs bg-white/95 dark:bg-[#0B192C]/95 backdrop-blur-md border border-slate-300 dark:border-slate-700/90 rounded-xl p-3 shadow-xl z-20">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-400">{selectedPin.trackingId}</span>
              <span 
                className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border"
                style={{
                  backgroundColor: `${selectedPin.color}18`,
                  color: selectedPin.color,
                  borderColor: `${selectedPin.color}35`
                }}
              >
                {selectedPin.status}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">{selectedPin.title}</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3 h-3 text-teal-600 dark:text-[#2DD4BF] shrink-0" />
              <span className="truncate">{selectedPin.location}</span>
            </p>
          </div>
        )}

        {/* Floating Pune Active Radius Badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-[#0B192C]/90 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-medium z-20 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-900 dark:text-white font-bold">Pune Jurisdiction</span>
          <span className="text-slate-500 dark:text-slate-400 font-mono">PMC</span>
        </div>
      </div>

      {/* Selectable Issue Location Tabs */}
      {filteredPins.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#081524] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Layers className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Focus:
          </span>
          {filteredPins.map((pin) => {
            const isSelected = selectedPin?.id === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => {
                  setSelectedPin(pin);
                  if (onSelectIssue) onSelectIssue(pin.trackingId);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white dark:text-[#081220] font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 dark:bg-[#0F1E33] dark:hover:bg-[#162846] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: isSelected ? '#ffffff' : pin.color }} 
                />
                <span>{pin.location.split(',')[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Map Legend & Category Quick Filter */}
      <div className="px-4 py-2.5 bg-slate-100 dark:bg-[#091524] border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categories:</span>
          
          <button
            onClick={() => setFilter('Road')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'Road' ? 'bg-amber-200 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span>Road</span>
          </button>

          <button
            onClick={() => setFilter('Water')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'Water' ? 'bg-blue-200 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span>Water</span>
          </button>

          <button
            onClick={() => setFilter('Waste')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'Waste' ? 'bg-emerald-200 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            <span>Waste</span>
          </button>

          <button
            onClick={() => setFilter('Safety')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'Safety' ? 'bg-rose-200 dark:bg-rose-500/20 text-rose-900 dark:text-rose-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            <span>Safety</span>
          </button>

          <button
            onClick={() => setFilter('Light')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'Light' ? 'bg-yellow-200 dark:bg-yellow-500/20 text-yellow-900 dark:text-yellow-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]" />
            <span>Streetlight</span>
          </button>
        </div>

        {filter !== 'All' && (
          <button
            onClick={() => setFilter('All')}
            className="text-[11px] text-teal-700 dark:text-[#2DD4BF] hover:underline font-bold cursor-pointer"
          >
            Reset filter
          </button>
        )}
      </div>
    </div>
  );
};
