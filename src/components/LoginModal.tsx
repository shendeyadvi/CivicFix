import React, { useState } from 'react';
import { X, User, Building, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (role: 'citizen' | 'official') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [role, setRole] = useState<'citizen' | 'official'>('citizen');
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
    onClose();
    if (onLoginSuccess) {
      onLoginSuccess(role);
    }
  };

  const handleDemoLogin = (demoRole: 'citizen' | 'official') => {
    setRole(demoRole);
    if (demoRole === 'citizen') {
      setIdentifier('+91 98765 43210 (Citizen Demo)');
    } else {
      setIdentifier('officer.kulkarni@pmc.punecorp.in (Authority Demo)');
    }
    setOtpSent(true);
    setOtp('1234');
    setLoggedIn(true);
    onClose();
    if (onLoginSuccess) {
      onLoginSuccess(demoRole);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#0B192C] border-2 border-deepTeal-500 dark:border-deepTeal-600 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-100 dark:bg-[#0F1E33] px-6 py-4 border-b border-slate-200 dark:border-[#1E355B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-200 dark:border-deepTeal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-deepTeal-600 dark:text-softMint-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">CivicFix Portal Access</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Citizen & PMC Officer Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white dark:bg-[#081220] border border-slate-300 dark:border-[#162846] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!loggedIn ? (
            <>
              {/* Role Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#081220] border border-slate-200 dark:border-[#162846]">
                <button
                  onClick={() => {
                    setRole('citizen');
                    setOtpSent(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'citizen'
                      ? 'bg-deepTeal-600 text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Citizen Login</span>
                </button>
                <button
                  onClick={() => {
                    setRole('official');
                    setOtpSent(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'official'
                      ? 'bg-deepTeal-600 text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Authority Portal</span>
                </button>
              </div>

              {/* Demo Accounts Quick-Access */}
              <div className="p-3 bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#1E355B] rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  ⚡ Quick Demo Login
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('citizen')}
                    className="py-2 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-700/60 text-slate-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-deepTeal-600 dark:text-teal-400 shrink-0" />
                    <span className="truncate">Citizen Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('official')}
                    className="py-2 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 text-slate-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">Authority Demo</span>
                  </button>
                </div>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      {role === 'citizen' ? 'Mobile Number / Citizen ID' : 'Gov Employee ID / Nodal Email'}
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={role === 'citizen' ? '+91 98765 43210' : 'officer.kulkarni@pmc.punecorp.in'}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-deepTeal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-deepTeal-600 to-softMint-500 text-slate-950 font-bold text-sm shadow-glow-teal hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Request One-Time Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      Enter 4-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="1 2 3 4"
                      className="w-full text-center tracking-widest font-mono text-xl px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-deepTeal-500 text-deepTeal-700 dark:text-softMint-300 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 text-center">
                      Simulated code sent to: {identifier || 'your device'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-deepTeal-600 hover:bg-deepTeal-500 text-slate-950 font-bold text-sm transition-all"
                  >
                    Verify & Enter Dashboard
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-status-success mx-auto" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Welcome to CivicFix {role === 'citizen' ? 'Citizen Hub' : 'Authority Console'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You are authenticated. Redirecting to your Pune municipal live workspace...
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onLoginSuccess) onLoginSuccess(role);
                }}
                className="w-full py-2.5 rounded-xl bg-deepTeal-600 text-slate-950 font-bold text-xs"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

