import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  MapPin,
  Briefcase,
  AlertCircle
} from 'lucide-react';

import { AuthService, type UserProfile } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (role: 'citizen' | 'official', user?: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'citizen' | 'official'>('citizen');
  
  // Sign In state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up state
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [selectedWard, setSelectedWard] = useState('Ward 12 - Shivajinagar');
  const [selectedDept, setSelectedDept] = useState('Road Works & Infrastructure');
  const [employeeId, setEmployeeId] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // State flags
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetErrors = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    if (!signInIdentifier.trim()) {
      setErrorMsg('Please enter your email, phone number, or officer ID.');
      return;
    }
    if (!signInPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const userProfile = await AuthService.login(signInIdentifier.trim(), signInPassword, role);
      setIsLoading(false);
      setSuccessMsg(`Welcome back, ${userProfile.name}!`);
      setTimeout(() => {
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(role, userProfile);
        }
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service & CivicFix Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      const userProfile = await AuthService.register({
        name: fullName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        phone: signUpPhone.trim() || undefined,
        ward: role === 'citizen' ? selectedWard : undefined,
        department: role === 'official' ? selectedDept : undefined,
        employeeId: role === 'official' ? (employeeId.trim() || 'PMC-OFF-' + Math.floor(1000 + Math.random() * 9000)) : undefined,
        role,
      });

      setIsLoading(false);
      setSuccessMsg(`Account created! Welcome to CivicFix, ${fullName.trim()}.`);
      setTimeout(() => {
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(role, userProfile);
        }
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to create account.');
    }
  };

  const handleDemoLogin = async (demoRole: 'citizen' | 'official') => {
    setRole(demoRole);
    resetErrors();
    setIsLoading(true);

    try {
      const demoProfile = await AuthService.demoLogin(demoRole);
      setIsLoading(false);
      setSuccessMsg(`Logged in with ${demoRole === 'citizen' ? 'Citizen' : 'Municipal Officer'} Demo credentials.`);
      setTimeout(() => {
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(demoRole, demoProfile);
        }
      }, 400);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Failed to login with demo credentials.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#0A1628] border border-slate-200 dark:border-[#1E355B] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-6 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 dark:bg-[#0F1E33] px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-[#1E355B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-deepTeal-600 to-softMint-400 p-[1px] shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-[#081220] rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-deepTeal-600 dark:text-softMint-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {authMode === 'signin' ? 'Welcome Back' : 'Create CivicFix Account'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {role === 'citizen' ? 'Citizen Portal Access' : 'Municipal Authority Workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white dark:bg-[#081220] border border-slate-200 dark:border-[#162846] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Sign In / Sign Up Mode Switcher */}
          <div className="flex border-b border-slate-200 dark:border-[#1E355B] pb-3 justify-between items-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  resetErrors();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'bg-deepTeal-600 text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  resetErrors();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-deepTeal-600 text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Role indicator pill */}
            <span className="text-[11px] font-semibold text-deepTeal-700 dark:text-softMint-400 bg-deepTeal-50 dark:bg-deepTeal-950/80 px-2 py-0.5 rounded border border-deepTeal-200 dark:border-deepTeal-700/50">
              {role === 'citizen' ? '👤 Citizen Role' : '🏛️ Authority Role'}
            </span>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#081220] border border-slate-200 dark:border-[#162846]">
            <button
              type="button"
              onClick={() => {
                setRole('citizen');
                resetErrors();
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'citizen'
                  ? 'bg-white dark:bg-[#0F1E33] text-deepTeal-700 dark:text-softMint-300 shadow-sm border border-slate-200 dark:border-[#1E355B]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Resident / Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('official');
                resetErrors();
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'official'
                  ? 'bg-white dark:bg-[#0F1E33] text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-[#1E355B]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Municipal Officer</span>
            </button>
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message Display */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Demo Access Bar */}
          <div className="p-2.5 bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#1E355B] rounded-xl flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              ⚡ Instant Demo:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('citizen')}
                className="py-1 px-2 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-700/60 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-[10px] font-bold transition-colors"
              >
                Citizen Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('official')}
                className="py-1 px-2 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-[10px] font-bold transition-colors"
              >
                Officer Demo
              </button>
            </div>
          </div>

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {role === 'citizen' ? 'Email Address or Mobile Number' : 'Official Email / Officer ID'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {role === 'citizen' ? <Mail className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder={
                      role === 'citizen'
                        ? 'citizen@example.com or +91 98765 43210'
                        : 'officer.kulkarni@pmc.punecorp.in'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-deepTeal-500 focus:ring-1 focus:ring-deepTeal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email/phone.')}
                    className="text-[11px] text-deepTeal-600 dark:text-softMint-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-deepTeal-500 focus:ring-1 focus:ring-deepTeal-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-deepTeal-600 focus:ring-deepTeal-500 dark:bg-[#081220] border-slate-300 dark:border-[#1E355B]"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-deepTeal-600 via-deepTeal-500 to-softMint-400 text-slate-950 font-bold text-sm shadow-glow-teal hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Log In to {role === 'citizen' ? 'Citizen Hub' : 'Authority Console'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      resetErrors();
                    }}
                    className="font-bold text-deepTeal-600 dark:text-softMint-400 hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-deepTeal-500 focus:ring-1 focus:ring-deepTeal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-deepTeal-500 focus:ring-1 focus:ring-deepTeal-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-deepTeal-500 focus:ring-1 focus:ring-deepTeal-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Role Specific Registration Fields */}
              {role === 'citizen' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Residential Ward / Zone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-deepTeal-500 focus:ring-1 focus:ring-deepTeal-500 transition-colors"
                    >
                      <optgroup label="📍 Pune Municipal Corporation (PMC)">
                        <option value="Ward 12 - Shivajinagar">Ward 12 - Shivajinagar / FC Road / JM Road</option>
                        <option value="Ward 8 - Kothrud">Ward 8 - Kothrud & Karve Nagar</option>
                        <option value="Ward 15 - Aundh">Ward 15 - Aundh, Baner & Balewadi</option>
                        <option value="Ward 22 - Viman Nagar">Ward 22 - Viman Nagar & Kalyani Nagar</option>
                        <option value="Ward 7 - Koregaon Park">Ward 7 - Koregaon Park & Bund Garden</option>
                        <option value="Ward 19 - Hadapsar">Ward 19 - Hadapsar & Magarpatta City</option>
                        <option value="Ward 5 - Camp Area">Ward 5 - MG Road, Camp Area & Cantonment</option>
                        <option value="Ward 14 - Deccan">Ward 14 - Deccan Gymkhana & Prabhat Road</option>
                        <option value="Ward 3 - Swargate / Mandai">Ward 3 - Swargate, Shukrawar Peth & Mandai</option>
                        <option value="Ward 18 - Kharadi">Ward 18 - Kharadi & Wagholi</option>
                        <option value="Ward 31 - Pashan / Bavdhan">Ward 31 - Pashan & Bavdhan</option>
                        <option value="Ward 10 - Sinhagad Road">Ward 10 - Sinhagad Road, Vadgaon & Dhayari</option>
                        <option value="Ward 25 - Katraj">Ward 25 - Katraj, Ambegaon & Dhankawadi</option>
                        <option value="Ward 2 - Bibwewadi">Ward 2 - Bibwewadi & Sahakar Nagar</option>
                        <option value="Ward 16 - Yerwada">Ward 16 - Yerwada & Vishrantwadi</option>
                        <option value="Ward 28 - Dhanori">Ward 28 - Dhanori & Lohegaon</option>
                        <option value="Ward 21 - Warje">Ward 21 - Warje & Kothrud Extension</option>
                        <option value="Ward 4 - Kasba Peth">Ward 4 - Kasba Peth & Shaniwar Wada</option>
                      </optgroup>
                      <optgroup label="🏭 Pimpri Chinchwad (PCMC)">
                        <option value="PCMC - Hinjawadi">PCMC - Hinjawadi IT Park / Phase 1-3</option>
                        <option value="PCMC - Wakad">PCMC - Wakad & Pimple Saudagar</option>
                        <option value="PCMC - Nigdi">PCMC - Nigdi & Pradhikaran</option>
                        <option value="PCMC - Ravet">PCMC - Ravet & Punawale</option>
                        <option value="PCMC - Pimple Nilakh">PCMC - Pimple Nilakh & Pimple Gurav</option>
                      </optgroup>
                      <optgroup label="🏙️ Other Major Cities & Metros">
                        <option value="Mumbai - Bandra / Andheri">Mumbai - Bandra, Andheri & Juhu (BMC)</option>
                        <option value="Mumbai - South Mumbai">Mumbai - Nariman Point & Colaba (BMC)</option>
                        <option value="Navi Mumbai - Vashi">Navi Mumbai - Vashi & Belapur (NMMC)</option>
                        <option value="Thane - Ghodbunder">Thane - Ghodbunder Road & Majiwada (TMC)</option>
                        <option value="Nagpur - Civil Lines">Nagpur - Civil Lines & Dharampeth (NMC)</option>
                        <option value="Nashik - Panchavati">Nashik - Panchavati & Gangapur Road (NMC)</option>
                        <option value="Bengaluru - Central / IT Corridor">Bengaluru - Indiranagar, Whitefield & Koramangala (BBMP)</option>
                        <option value="Delhi NCR - Central / South">Delhi NCR - Connaught Place & South Delhi (MCD)</option>
                        <option value="Hyderabad - HITEC City">Hyderabad - HITEC City & Gachibowli (GHMC)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-deepTeal-500"
                    >
                      <option value="Road Works & Infrastructure">Road Works & Infrastructure</option>
                      <option value="Water Supply & Sewage">Water Supply & Sewage</option>
                      <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                      <option value="Electrical & Public Lighting">Electrical & Public Lighting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Officer / Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. PMC-OFF-8842"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-deepTeal-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-deepTeal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-deepTeal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-deepTeal-600 focus:ring-deepTeal-500 dark:bg-[#081220] border-slate-300 dark:border-[#1E355B]"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    I agree to the CivicFix Terms of Service, Public Community Guidelines, and Privacy Policy.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-deepTeal-600 via-deepTeal-500 to-softMint-400 text-slate-950 font-bold text-sm shadow-glow-teal hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      resetErrors();
                    }}
                    className="font-bold text-deepTeal-600 dark:text-softMint-400 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
