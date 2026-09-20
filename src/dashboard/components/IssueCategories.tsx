import React from 'react';
import { 
  AlertOctagon, 
  Lightbulb, 
  Trash2, 
  Droplets, 
  TrafficCone, 
  Building2, 
  ArrowRight,
  Plus
} from 'lucide-react';

interface IssueCategoriesProps {
  onSelectCategory: (categoryTitle: string) => void;
}

export const IssueCategories: React.FC<IssueCategoriesProps> = ({
  onSelectCategory
}) => {
  const categories = [
    {
      id: 'roads',
      title: 'Roads & Potholes',
      description: 'Damaged roads, potholes, broken sidewalks',
      icon: AlertOctagon,
      iconColor: '#D97706',
      bgColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      badge: 'Most Reported'
    },
    {
      id: 'streetlights',
      title: 'Streetlights',
      description: 'Broken or non-functional streetlights & dark spots',
      icon: Lightbulb,
      iconColor: '#CA8A04',
      bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
      badge: 'Fast Fix (<24h)'
    },
    {
      id: 'waste',
      title: 'Waste & Sanitation',
      description: 'Garbage overflow and waste collection delays',
      icon: Trash2,
      iconColor: '#16A34A',
      bgColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      badge: 'Sanitation Cell'
    },
    {
      id: 'water',
      title: 'Water & Drainage',
      description: 'Leaks, drainage clogs, water supply issues',
      icon: Droplets,
      iconColor: '#2563EB',
      bgColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      badge: 'Jal Sansthan'
    },
    {
      id: 'traffic',
      title: 'Traffic & Signals',
      description: 'Broken signals and traffic-related road hazards',
      icon: TrafficCone,
      iconColor: '#DB2777',
      bgColor: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20',
      badge: 'Traffic Dept'
    },
    {
      id: 'infra',
      title: 'Public Infrastructure',
      description: 'Damaged footbridges, parks, open manholes',
      icon: Building2,
      iconColor: '#7C3AED',
      bgColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      badge: 'Municipal Works'
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800/90 p-5 sm:p-6 shadow-sm transition-colors duration-300">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 rounded-full bg-emerald-600 dark:bg-[#10B981]" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">What Do You Want to Report?</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Click any civic category to start a pre-filled submission.
          </p>
        </div>
      </div>

      {/* 6 Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.title)}
              className="rounded-xl bg-slate-50/80 dark:bg-[#0F1E33] border border-slate-200 dark:border-slate-800/90 hover:border-teal-500 dark:hover:border-teal-500/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${cat.bgColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
                    {cat.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3 group-hover:text-teal-700 dark:group-hover:text-[#2DD4BF] transition-colors">
                  {cat.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-teal-700 dark:text-[#2DD4BF] group-hover:text-teal-900 dark:group-hover:text-teal-300">
                <span className="flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Start Report
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
