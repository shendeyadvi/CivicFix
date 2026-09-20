import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StatsStrip } from './components/StatsStrip';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { IssueStatusPreview } from './components/IssueStatusPreview';
import { CommunityImpact } from './components/CommunityImpact';
import { WhyCivicFix } from './components/WhyCivicFix';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { ReportModal } from './components/ReportModal';
import { TrackModal } from './components/TrackModal';
import { LoginModal } from './components/LoginModal';
import { DashboardPage } from './dashboard/DashboardPage';
import { AuthorityDashboardPage } from './dashboard/authority/AuthorityDashboardPage';

export const AppContent: React.FC = () => {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [userRole, setUserRole] = useState<'citizen' | 'official'>('citizen');

  if (view === 'dashboard') {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-[#081220] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        {userRole === 'official' ? (
          <AuthorityDashboardPage
            onBackToLanding={() => setView('landing')}
          />
        ) : (
          <DashboardPage
            onOpenReportModal={() => setReportModalOpen(true)}
            onOpenTrackModal={() => setTrackModalOpen(true)}
            onBackToLanding={() => setView('landing')}
          />
        )}
        {/* Modals for Dashboard */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
        <TrackModal
          isOpen={trackModalOpen}
          onClose={() => setTrackModalOpen(false)}
        />
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={(role) => {
            setUserRole(role);
            setView('dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#081220] text-slate-900 dark:text-slate-100 font-sans relative selection:bg-deepTeal-600 selection:text-white transition-colors duration-300">
      {/* Top Fixed Navigation with Theme Toggle and Home/Dashboard link */}
      <Navbar
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenTrackModal={() => setTrackModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onNavigateToDashboard={() => setLoginModalOpen(true)}
      />

      {/* Main Page Sections */}
      <main id="main-content">
        <Hero
          onOpenReportModal={() => setLoginModalOpen(true)}
          onOpenTrackModal={() => setLoginModalOpen(true)}
        />
        <StatsStrip />
        <HowItWorks
          onOpenReportModal={() => setLoginModalOpen(true)}
        />
        <Features
          onOpenReportModal={() => setLoginModalOpen(true)}
        />
        <IssueStatusPreview
          onOpenReportModal={() => setLoginModalOpen(true)}
          onOpenTrackModal={() => setLoginModalOpen(true)}
        />
        <CommunityImpact
          onOpenReportModal={() => setLoginModalOpen(true)}
        />
        <WhyCivicFix
          onOpenReportModal={() => setLoginModalOpen(true)}
        />
        <FinalCTA
          onOpenReportModal={() => setLoginModalOpen(true)}
          onOpenTrackModal={() => setLoginModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenReportModal={() => setLoginModalOpen(true)}
        onOpenTrackModal={() => setLoginModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      {/* Modals */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
      <TrackModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(role) => {
          setUserRole(role);
          setView('dashboard');
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
