import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CivicFix ErrorBoundary caught an unhandled render error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      // Clear any corrupted local state if needed
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  private handleReset = () => {
    try {
      this.setState({ hasError: false, error: null });
    } catch {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#081220] flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100">
          <div className="max-w-md w-full bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl font-bold">
              ⚡
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              CivicFix Portal
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              A temporary display error occurred while rendering the page. Click below to refresh and return to the main portal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white text-sm font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
