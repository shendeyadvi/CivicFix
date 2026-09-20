import React, { useState, useEffect } from 'react';
import { MapPin, Layers, Compass } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { ReportsService } from '../../../services/reportsService';

interface MapMarker {
  id: string;
  title: string;
  category: string;
  color: string;
  top: string;
  left: string;
}

export const JurisdictionMap: React.FC = () => {
  const { theme } = useTheme();
  const [timeFilter, setTimeFilter] = useState<'Today' | '7 Days' | '30 Days'>('7 Days');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  const loadMarkers = () => {
    const reports = ReportsService.getReports();
    const mapped: MapMarker[] = reports.map((r, idx) => {
      let color = '#3B82F6';
      if (r.priority === 'Critical') color = '#EF4444';
      else if (r.category.includes('Road')) color = '#F59E0B';
      else if (r.category.includes('Light')) color = '#A855F7';
      else if (r.category.includes('Waste') || r.category.includes('Sanitation')) color = '#22C55E';
      else if (r.category.includes('Water') || r.category.includes('Drain')) color = '#0EA5E9';

      // Positional offsets on mock map overlay
      const topPct = 25 + ((idx * 13) % 55);
      const leftPct = 20 + ((idx * 17) % 65);

      return {
        id: r.id,
        title: `${r.title} (${r.location.split(',')[0]})`,
        category: r.category,
        color,
        top: `${topPct}%`,
        left: `${leftPct}%`,
      };
    });
    setMarkers(mapped);
  };

  useEffect(() => {
    loadMarkers();
    const handleUpdate = () => loadMarkers();
    window.addEventListener('civicfix_reports_updated', handleUpdate);
    return () => {
      window.removeEventListener('civicfix_reports_updated', handleUpdate);
    };
  }, []);

  const filteredMarkers = categoryFilter === 'All'
    ? markers
    : markers.filter((m) => m.category.toLowerCase().includes(categoryFilter.toLowerCase()));

  return (
    <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
            Complaints Across Your Jurisdiction ({markers.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Geographic complaint distribution across Pune Municipal Corporation (PMC) wards
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 dark:bg-[#0F1E33] p-1 border border-slate-200 dark:border-[#1E355B]">
            {(['Today', '7 Days', '30 Days'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  timeFilter === t
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Water">Water Supply</option>
            <option value="Waste">Waste Management</option>
            <option value="Road">Roads & Infra</option>
            <option value="Light">Streetlights</option>
          </select>
        </div>
      </div>

      {/* Map Graphic Surface */}
      <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#EBF3F0] dark:bg-[#071322]">
        {/* Real Interactive Map Iframe centered on Pune */}
        <iframe
          title="PMC Pune Jurisdiction Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://maps.google.com/maps?q=Pune%20Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          className={`w-full h-full transition-opacity duration-300 ${
            theme === 'dark' ? 'invert opacity-70 contrast-125' : 'opacity-90'
          }`}
        />

        {/* Overlay Pins & Legend */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Overlay Grid lines for Operations room feel */}
          <div className="w-full h-full bg-[linear-gradient(to_right,#0f766e0a_1px,transparent_1px),linear-gradient(to_bottom,#0f766e0a_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Interactive Marker Pins */}
          {filteredMarkers.map((m) => (
            <div
              key={m.id}
              style={{ top: m.top, left: m.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-125 animate-bounce"
                style={{ backgroundColor: m.color }}
              >
                <MapPin className="w-4 h-4 fill-white" />
              </div>

              {/* Marker Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-8 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap z-30">
                {m.title}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Controls Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#0B192C]/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-[#1E355B] shadow-lg flex items-center gap-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> Water</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Waste</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Roads</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Lighting</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
        </div>

        <div className="absolute top-3 right-3 bg-white/90 dark:bg-[#0B192C]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E355B] shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400" />
          <span>PMC Jurisdiction</span>
        </div>
      </div>
    </div>
  );
};
