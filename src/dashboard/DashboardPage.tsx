import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { MobileHeader, MobileBottomBar } from "./components/MobileNavigation";
import { Header } from "./components/Header";
import { ReportCTA } from "./components/ReportCTA";
import { StatsCards } from "./components/StatsCards";
import { RecentReports } from "./components/RecentReports";
import { IssueMap } from "./components/IssueMap";
import { NearbyIssues } from "./components/NearbyIssues";
import { IssueCategories } from "./components/IssueCategories";
import { CommunityImpactSection } from "./components/CommunityImpactSection";
import { ActivityFeed } from "./components/ActivityFeed";
import { ReportingFlowPreview } from "./components/ReportingFlowPreview";
import { ContributionCard } from "./components/ContributionCard";
import { DashboardFooter } from "./components/DashboardFooter";

interface DashboardPageProps {
  onOpenReportModal?: (category?: string) => void;
  onOpenTrackModal?: (trackingId?: string) => void;
  onBackToLanding?: () => void;
}

interface ViewProps {
  onOpenReport: (category?: string) => void;
  onOpenTrack: (trackingId?: string) => void;
  onSelectTab: (tab: string) => void;
  onBackToLanding?: () => void;
}

const HomeView: React.FC<ViewProps> = ({ onOpenReport, onSelectTab }) => (
  <div className="space-y-6">
    {/* Primary action — Report an Issue */}
    <ReportCTA
      onOpenReport={() => onOpenReport()}
      onViewMyReports={() => onSelectTab("my-reports")}
    />

    {/* Quick stats summary */}
    <StatsCards
      onCardClick={(filter) => {
        if (filter === "my-reports") onSelectTab("my-reports");
      }}
    />

    {/* Guide user toward using the navbar */}
    <div className="rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800/90 p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Explore your dashboard</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Use the sidebar to navigate between sections — track your reports, discover nearby issues, or dive into the community feed.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onSelectTab("my-reports")}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0F1E33] hover:bg-teal-50 dark:hover:bg-teal-500/10 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500/40 transition-all group text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 text-lg">📋</span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-[#2DD4BF]">My Reports</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track your submitted issues</p>
          </div>
        </button>
        <button
          onClick={() => onSelectTab("nearby")}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0F1E33] hover:bg-teal-50 dark:hover:bg-teal-500/10 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500/40 transition-all group text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 text-lg">🗺️</span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-[#2DD4BF]">Nearby Issues</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Civic issues around your area</p>
          </div>
        </button>
      </div>
    </div>

    <DashboardFooter onBackToLanding={undefined} />
  </div>
);

const MyReportsView: React.FC<ViewProps> = ({ onOpenReport, onOpenTrack }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Reports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All civic issues you have reported — track status and updates.</p>
      </div>
      <button
        onClick={() => onOpenReport()}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white text-sm font-bold shadow-md hover:brightness-110 transition-all"
      >
        + New Report
      </button>
    </div>
    <RecentReports
      onViewAll={() => {}}
      onSelectReport={(id) => onOpenTrack(id)}
      onOpenReport={() => onOpenReport()}
    />
    <ContributionCard totalReported={3} totalResolved={0} />
  </div>
);

const NearbyView: React.FC<ViewProps> = ({ onOpenTrack }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Nearby Issues</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Civic problems reported within 2 km of your location in Pune.</p>
    </div>
    <IssueMap
      onExploreMap={() => {}}
      onSelectIssue={(id) => onOpenTrack(id)}
    />
    <NearbyIssues
      onViewAll={() => {}}
      onSelectIssue={(id) => onOpenTrack(id)}
    />
  </div>
);

const CommunityView: React.FC<ViewProps> = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Community</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time civic activity happening around Pune wards.</p>
    </div>
    <ActivityFeed />
    <ReportingFlowPreview onStartReport={() => {}} />
  </div>
);

const ImpactView: React.FC<ViewProps> = ({ onOpenReport }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Community Impact</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Civic improvement metrics and resolution progress across Pune.</p>
    </div>
    <CommunityImpactSection onOpenReport={() => onOpenReport()} />
    <IssueCategories onSelectCategory={(cat) => onOpenReport(cat)} />
  </div>
);

const SettingsView: React.FC<ViewProps> = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
      &#9881;&#65039;
    </div>
    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Settings</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">Profile, notifications, and preferences will appear here.</p>
  </div>
);

const HelpView: React.FC<ViewProps> = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
      &#10067;
    </div>
    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Help &amp; Support</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">FAQs, contact support, and platform guides will appear here.</p>
  </div>
);

const TAB_TITLES: Record<string, string> = {
  home: "Dashboard",
  "my-reports": "My Reports",
  nearby: "Nearby Issues",
  community: "Community",
  impact: "Impact",
  settings: "Settings",
  help: "Help & Support",
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenReportModal,
  onOpenTrackModal,
  onBackToLanding,
}) => {
  const [activeTab, setActiveTab] = useState("home");

  const handleOpenReport = (category?: string) => {
    if (onOpenReportModal) onOpenReportModal(category);
  };

  const handleOpenTrack = (trackingId?: string) => {
    if (onOpenTrackModal) onOpenTrackModal(trackingId);
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const viewProps: ViewProps = {
    onOpenReport: handleOpenReport,
    onOpenTrack: handleOpenTrack,
    onSelectTab: handleSelectTab,
    onBackToLanding,
  };

  const renderView = () => {
    switch (activeTab) {
      case "home":       return <HomeView {...viewProps} />;
      case "my-reports": return <MyReportsView {...viewProps} />;
      case "nearby":     return <NearbyView {...viewProps} />;
      case "community":  return <CommunityView {...viewProps} />;
      case "impact":     return <ImpactView {...viewProps} />;
      case "settings":   return <SettingsView {...viewProps} />;
      case "help":       return <HelpView {...viewProps} />;
      default:           return <HomeView {...viewProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#081220] text-slate-900 dark:text-slate-100 font-sans flex antialiased selection:bg-[#0F766E] selection:text-white transition-colors duration-300">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenReport={() => handleOpenReport()}
        onBackToLanding={onBackToLanding}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <MobileHeader
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenReport={() => handleOpenReport()}
          onBackToLanding={onBackToLanding}
        />

        <div className="hidden lg:block">
          <Header
            userName="Aarav Deshmukh"
            wardName={`FC Road / Shivajinagar, Ward 12, Pune — ${TAB_TITLES[activeTab] ?? "Dashboard"}`}
            onOpenReport={() => handleOpenReport()}
            onOpenTrack={() => handleOpenTrack()}
          />
        </div>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {renderView()}
        </main>

        <MobileBottomBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenReport={() => handleOpenReport()}
        />
      </div>
    </div>
  );
};
