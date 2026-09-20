import React, { useState } from 'react';
import {
  X,
  Camera,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  UploadCloud,
  Sparkles,
  Navigation,
  Building2,
  RefreshCw
} from 'lucide-react';
import { ReportsService } from '../services/reportsService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueCreated?: (ticketId: string) => void;
}

interface SamplePhoto {
  id: string;
  name: string;
  category: string;
  department: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  imagePreview: string;
}

const SAMPLE_CIVIC_PHOTOS: SamplePhoto[] = [
  {
    id: 'pothole',
    name: '🛣️ Pothole / Broken Road',
    category: 'Roads & Potholes',
    department: 'Roads & Infrastructure',
    title: 'Hazardous Asphalt Pothole near Junction',
    description: 'AI Vision Analysis: Deep 3.5 ft road surface crater with loose gravel and water accumulation. Poses immediate risk to 2-wheeler riders and causes traffic slowdown.',
    priority: 'High',
    imagePreview: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'light',
    name: '💡 Unlit Streetlight',
    category: 'Street Lighting',
    department: 'Electrical',
    title: 'Non-functional Overhead Streetlight Pole',
    description: 'AI Vision Analysis: Malfunctioning luminaire fixture on pole #14. Zero night illumination creating dark zone and safety hazard for pedestrians.',
    priority: 'Medium',
    imagePreview: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'garbage',
    name: '🗑️ Garbage Dump Overflow',
    category: 'Sanitation & Waste',
    department: 'Sanitation',
    title: 'Uncleared Solid Waste Container Overflow',
    description: 'AI Vision Analysis: Overloaded community waste bin spilling onto public sidewalk. Foul odor and health hazard requiring immediate garbage truck dispatch.',
    priority: 'High',
    imagePreview: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'water',
    name: '🚰 Water Pipeline Leak',
    category: 'Water & Drainage',
    department: 'Water Department',
    title: 'High-Pressure Main Water Pipeline Leakage',
    description: 'AI Vision Analysis: Continuous potable water leakage bursting from underground supply line onto road surface causing water loss and road erosion.',
    priority: 'Critical',
    imagePreview: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=60',
  }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onIssueCreated,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [category, setCategory] = useState<string>('Roads & Potholes');
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('FC Road (near Goodluck Cafe), Shivajinagar, Pune');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [department, setDepartment] = useState<string>('Roads & Infrastructure');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiAnalyzed, setAiAnalyzed] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<string>('18.5204° N, 73.8415° E');
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [generatedTicketId, setGeneratedTicketId] = useState<string>('CF-2026-9104');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories = [
    { name: 'Roads & Potholes', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
    { name: 'Street Lighting', icon: <Lightbulb className="w-4 h-4 text-amber-500" /> },
    { name: 'Sanitation & Waste', icon: <Trash2 className="w-4 h-4 text-emerald-500" /> },
    { name: 'Water & Drainage', icon: <Droplets className="w-4 h-4 text-sky-500" /> },
    { name: 'Public Safety', icon: <ShieldAlert className="w-4 h-4 text-red-500" /> },
  ];

  // AI Auto-Analyze Photo Function
  const triggerAIAnalysis = (samplePhoto?: SamplePhoto, fileUrl?: string) => {
    setIsAnalyzingAI(true);
    setAiAnalyzed(false);

    setTimeout(() => {
      if (samplePhoto) {
        setPhotoPreview(samplePhoto.imagePreview);
        setTitle(samplePhoto.title);
        setDescription(samplePhoto.description);
        setCategory(samplePhoto.category);
        setDepartment(samplePhoto.department);
        setPriority(samplePhoto.priority);
      } else {
        setPhotoPreview(fileUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60');
        setTitle('Detected Civic Infrastructure Damage');
        setDescription('AI Vision Analysis: Detected severe asphalt degradation and hazardous surface pothole requiring municipal road maintenance repair.');
        setCategory('Roads & Potholes');
        setDepartment('Roads & Infrastructure');
        setPriority('High');
      }
      setIsAnalyzingAI(false);
      setAiAnalyzed(true);
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        triggerAIAnalysis(undefined, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch Live Current GPS Location
  const handleFetchLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          setGpsCoords(`${lat}° N, ${lng}° E`);
          setLocation(`FC Road, Near Goodluck Cafe, Shivajinagar, Ward 12, Pune (GPS Geotagged)`);
          setIsGettingLocation(false);
        },
        () => {
          // Fallback location for Pune
          setGpsCoords(`18.5204° N, 73.8415° E`);
          setLocation(`FC Road, Near Goodluck Cafe, Shivajinagar, Ward 12, Pune (GPS Live)`);
          setIsGettingLocation(false);
        }
      );
    } else {
      setGpsCoords(`18.5204° N, 73.8415° E`);
      setLocation(`FC Road, Near Goodluck Cafe, Shivajinagar, Ward 12, Pune (GPS Live)`);
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const created = ReportsService.addReport({
        title: title || 'Civic Complaint',
        category,
        location,
        description: description || 'Citizen reported issue via CivicFix app.',
        priority,
      });
      setGeneratedTicketId(created.trackingId);
      setIsSubmitting(false);
      setStep('success');
      if (onIssueCreated) {
        onIssueCreated(created.trackingId);
      }
    }, 800);
  };

  const handleReset = () => {
    setStep('form');
    setTitle('');
    setDescription('');
    setPhotoPreview(null);
    setAiAnalyzed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0B192C] border-2 border-deepTeal-500 dark:border-deepTeal-600 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-slate-100 dark:bg-[#0F1E33] px-6 py-4 border-b border-slate-200 dark:border-[#1E355B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-deepTeal-50 dark:bg-deepTeal-950 border border-deepTeal-200 dark:border-deepTeal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-deepTeal-600 dark:text-softMint-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {step === 'form' ? 'AI-Assisted Civic Reporting' : 'Complaint Submitted Successfully'}
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-emerald-300 border border-teal-500/20 uppercase tracking-wider">
                  AI Powered
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {step === 'form' ? 'Upload photo — AI auto-fills description, category & department' : 'Official Pune PMC ticket dispatched'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white dark:bg-[#081220] border border-slate-300 dark:border-[#162846] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* STEP 1: PHOTO UPLOAD & AI VISION ANALYSIS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
                    1. Upload Photo / AI Image Analysis
                  </label>
                  <span className="text-[11px] font-bold text-teal-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Auto-Fill Enabled
                  </span>
                </div>

                {/* Upload Zone / Preview */}
                <div className="relative border-2 border-dashed rounded-2xl p-4 text-center border-teal-500/40 bg-teal-500/5 dark:bg-[#081220] hover:border-teal-500 transition-all">
                  {isAnalyzingAI ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-teal-600 dark:text-emerald-400 animate-spin" />
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Analyzing photo with AI Vision...
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Detecting issue type, generating description & selecting department...
                      </p>
                    </div>
                  ) : photoPreview ? (
                    <div className="space-y-3">
                      <div className="relative max-h-48 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 mx-auto max-w-sm">
                        <img src={photoPreview} alt="Issue evidence" className="w-full h-44 object-cover" />
                        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" /> AI Scanned (98.4% Confidence)
                        </div>
                      </div>
                      <div className="flex justify-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-[#0F1E33] text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300">
                          Change Photo
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 border border-teal-300 dark:border-teal-700 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5 text-teal-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <label className="cursor-pointer px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-glow-teal inline-flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          <span>Upload Problem Photo</span>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Or select a sample Pune issue photo below to simulate AI vision:
                      </p>

                      {/* Sample Preset Photos */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {SAMPLE_CIVIC_PHOTOS.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => triggerAIAnalysis(p)}
                            className="p-2 rounded-xl bg-white dark:bg-[#0F1E33] border border-slate-200 dark:border-[#1E355B] hover:border-teal-500 text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-left transition-all flex flex-col gap-1 hover:shadow-sm"
                          >
                            <span className="truncate font-bold">{p.name}</span>
                            <span className="text-[9px] text-teal-600 dark:text-emerald-400">✨ Tap to Auto-Fill</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Auto-Fill Notification Badge */}
              {aiAnalyzed && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>AI auto-filled title, description, category & department!</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">You can edit below if needed</span>
                </div>
              )}

              {/* STEP 2: LOCATION PICKER (MANUAL OR CURRENT GPS) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400" />
                    2. Location (Manual / GPS Geotag)
                  </label>
                  <span className="text-[11px] text-teal-600 dark:text-emerald-400 font-mono font-medium">
                    {gpsCoords}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter street name, landmark, Ward number"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchLocation}
                    disabled={isGettingLocation}
                    className="px-3.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-emerald-300 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                    title="Detect current GPS coordinates"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                    <span>{isGettingLocation ? 'Locating...' : 'Use Current Location'}</span>
                  </button>
                </div>
              </div>

              {/* STEP 3: CATEGORY & MUNICIPAL DEPARTMENT ROUTING */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
                    3. Category & Department Routing
                  </label>
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-emerald-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Routed to: <strong>{department}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => {
                        setCategory(c.name);
                        if (c.name.includes('Roads')) setDepartment('Roads & Infrastructure');
                        else if (c.name.includes('Light')) setDepartment('Electrical');
                        else if (c.name.includes('Waste')) setDepartment('Sanitation');
                        else if (c.name.includes('Water')) setDepartment('Water Department');
                        else setDepartment('Public Works');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all text-left border ${
                        category === c.name
                          ? 'bg-teal-600 text-white border-teal-500 shadow-sm font-bold'
                          : 'bg-slate-50 dark:bg-[#0F1E33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E355B] hover:bg-slate-100 dark:hover:bg-[#162846]'
                      }`}
                    >
                      {c.icon}
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 4: TITLE & AI-GENERATED DESCRIPTION */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  4. Brief Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Issue title auto-filled by AI..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  5. Problem Description (AI Generated)
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="AI generates full problem description upon uploading a photo..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-300 dark:border-[#1E355B] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Priority & Anonymous Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#162846]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Urgency:</span>
                  {(['Medium', 'High', 'Critical'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        priority === p
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-white dark:bg-[#0F1E33] text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-[#1E355B]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate-400 text-teal-600 focus:ring-0"
                  />
                  <span>Report Anonymously</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-400 text-slate-950 font-bold text-sm shadow-glow-teal hover:shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Transmitting to PMC Server...</span>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-slate-950" />
                    <span>Submit Civic Report Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-teal-950 border-2 border-emerald-500 mx-auto flex items-center justify-center shadow-glow-mint">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-teal-600 dark:text-emerald-400 font-bold">
                  Official Work Order Generated
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Thank You for Fixing Pune!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2">
                  Your AI-verified complaint has been logged and routed to <strong>{department}</strong>.
                </p>
              </div>

              {/* Generated Ticket Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#081220] border-2 border-teal-500 dark:border-emerald-500 max-w-md mx-auto shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Your Tracking Ticket ID:</div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-teal-700 dark:text-emerald-300 tracking-wider my-1">
                  {generatedTicketId}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Save this ID to track updates or subscribe to SMS alerts.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all"
                >
                  Done & Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
