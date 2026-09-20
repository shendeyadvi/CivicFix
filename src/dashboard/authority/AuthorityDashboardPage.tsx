import React, { useState } from 'react';
import { AuthoritySidebar, type AuthorityTab } from './components/AuthoritySidebar';
import { AuthorityHeader } from './components/AuthorityHeader';
import { AuthorityStats } from './components/AuthorityStats';
import { ComplaintQueue } from './components/ComplaintQueue';
import { JurisdictionMap } from './components/JurisdictionMap';
import { DepartmentPerformance } from './components/DepartmentPerformance';
import { AuthorityActivityFeed } from './components/AuthorityActivityFeed';
import { AuthorityQuickActions } from './components/AuthorityQuickActions';
import { AuthorityMobileNavigation } from './components/AuthorityMobileNavigation';
import {
  ClipboardCheck,
  UserPlus,
  MapPin,
  Download,
  Calendar
} from 'lucide-react';

interface AuthorityDashboardPageProps {
  onBackToLanding?: () => void;
}

export const AuthorityDashboardPage: React.FC<AuthorityDashboardPageProps> = ({
  onBackToLanding,
}) => {
  const [activeTab, setActiveTab] = useState<AuthorityTab>('dashboard');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const handleSelectStatFilter = (filter: string) => {
    setStatusFilter(filter);
    setActiveTab('complaints');
  };

  const handleQuickAction = (label: string) => {
    if (label === 'Review Complaints' || label === 'Review') {
      setActiveTab('complaints');
      setStatusFilter('New');
    } else if (label === 'Assign Issues' || label === 'Assign') {
      setActiveTab('assignments');
    } else if (label === 'View Issue Map' || label === 'Follow Up') {
      setActiveTab('map');
    } else if (label === 'Generate Report') {
      alert('Generating PMC Municipal Weekly Performance PDF Report...');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9F8] dark:bg-[#081220] text-slate-900 dark:text-slate-100 font-sans flex flex-col lg:flex-row transition-colors duration-300">
      {/* Fixed Left Sidebar (Desktop) */}
      <div className="hidden lg:block">
        <AuthoritySidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onBackToLanding={onBackToLanding}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header Navigation */}
        <AuthorityHeader
          onOpenNotifications={() => setActiveTab('notifications')}
          onBackToLanding={onBackToLanding}
        />

        {/* Dashboard Main Workspace */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 max-w-7xl w-full mx-auto pb-24 lg:pb-12 space-y-6">
          {/* Welcome Banner + Operational Toolbar */}
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Good morning, Officer Kulkarni.
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  PMC Admin Officer
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                “Here's what's happening across your jurisdiction today.”
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-slate-100 dark:bg-[#081220] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400" />
                <span>20 September 2026</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  Ward: Central Zone
                </span>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickAction('Review Complaints')}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-glow-teal flex items-center gap-1.5 transition-all"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Review Complaints</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Assign Issues')}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400" />
                  <span>Assign</span>
                </button>
                <button
                  onClick={() => handleQuickAction('View Issue Map')}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400" />
                  <span>Map</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Generate Report')}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold transition-colors"
                  title="Generate Weekly PDF Report"
                >
                  <Download className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Key Performance Statistics Row (6 Cards) */}
          <AuthorityStats onSelectFilter={handleSelectStatFilter} />

          {/* Tab View Routing */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Actions Bar */}
              <AuthorityQuickActions
                onSelectTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <ComplaintQueue initialStatusFilter={statusFilter} />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-6">
              <JurisdictionMap />
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
                Department Crew Assignments
              </h3>
              <p className="text-xs text-slate-500">
                Dispatch Nodal Officers, Inspection Teams & Ground Repair Wings
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  { name: 'Roads & Infra Wing', lead: 'Eng. Rajesh Deshmukh', active: 14, status: 'On Duty' },
                  { name: 'Electrical Response Crew', lead: 'Tech Lead Kulkarni', active: 8, status: 'Dispatched' },
                  { name: 'Water Emergency Taskforce', lead: 'Officer Patil', active: 19, status: 'High Alert' },
                  { name: 'Sanitation Division B', lead: 'Inspector Shinde', active: 12, status: 'On Duty' },
                ].map((team) => (
                  <div key={team.name} className="p-4 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{team.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-emerald-400">
                        {team.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Team Lead: <strong className="text-slate-900 dark:text-slate-200">{team.lead}</strong></p>
                    <p className="text-[11px] text-slate-500">{team.active} complaints assigned today</p>
                    <button onClick={() => alert(`Dispatching extra crew for ${team.name}`)} className="w-full py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs mt-2 hover:bg-teal-500">
                      Reassign / Dispatch Crew
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-6">
              <DepartmentPerformance />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                All Operational Notifications
              </h3>
              <AuthorityActivityFeed />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#1E355B] rounded-2xl p-6 shadow-sm space-y-4 max-w-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center">
                  AK
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Officer Kulkarni</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">PMC Central Zone Nodal Officer</p>
                  <p className="text-[11px] text-slate-400 font-mono">officer.kulkarni@pmc.punecorp.in</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-[#081220] rounded-xl flex justify-between">
                  <span className="text-slate-500">Jurisdiction</span>
                  <span className="font-bold text-slate-900 dark:text-white">Pune Municipal Corp (PMC) — Central Zone</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#081220] rounded-xl flex justify-between">
                  <span className="text-slate-500">Government ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">PMC-OFF-8842</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#081220] rounded-xl flex justify-between">
                  <span className="text-slate-500">Role Authority</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Level 4 Admin Access</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <AuthorityMobileNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  );
};
