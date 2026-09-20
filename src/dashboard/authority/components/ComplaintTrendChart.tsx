import React, { useState } from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';

export const ComplaintTrendChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7 Days' | '30 Days' | '3 Months'>('30 Days');

  // Sample data points for chart
  const data = [
    { label: 'Mon', received: 42, resolved: 38 },
    { label: 'Tue', received: 58, resolved: 49 },
    { label: 'Wed', received: 34, resolved: 41 },
    { label: 'Thu', received: 62, resolved: 55 },
    { label: 'Fri', received: 75, resolved: 68 },
    { label: 'Sat', received: 48, resolved: 45 },
    { label: 'Sun', received: 32, resolved: 30 },
  ];

  const maxVal = 80;

  return (
    <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
            Complaint Trends
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complaints Received vs Resolved over time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" /> Received
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Resolved
            </span>
          </div>

          <div className="flex rounded-lg bg-slate-100 dark:bg-[#0F1E33] p-1 border border-slate-200 dark:border-[#1E355B]">
            {(['7 Days', '30 Days', '3 Months'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  timeRange === r
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
          <span className="font-bold text-slate-900 dark:text-white">
            +8.4% complaints logged this month
          </span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          Sample Dashboard Telemetry
        </span>
      </div>

      {/* SVG Bar Chart Graphic */}
      <div className="h-56 pt-4 flex items-end justify-between gap-3 px-2">
        {data.map((item) => {
          const receivedHeight = (item.received / maxVal) * 100;
          const resolvedHeight = (item.resolved / maxVal) * 100;

          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                {/* Received Bar */}
                <div
                  className="w-3.5 sm:w-5 rounded-t-md bg-teal-600 dark:bg-teal-500 transition-all duration-300 group-hover:opacity-80"
                  style={{ height: `${receivedHeight}%` }}
                  title={`Received: ${item.received}`}
                />
                {/* Resolved Bar */}
                <div
                  className="w-3.5 sm:w-5 rounded-t-md bg-emerald-500 dark:bg-emerald-400 transition-all duration-300 group-hover:opacity-80"
                  style={{ height: `${resolvedHeight}%` }}
                  title={`Resolved: ${item.resolved}`}
                />
              </div>

              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
