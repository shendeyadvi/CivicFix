export interface CivicIssue {
  id: string;
  trackingId: string;
  title: string;
  category: 'Roads & Potholes' | 'Street Lighting' | 'Sanitation & Waste' | 'Water & Drainage' | 'Public Safety';
  location: string;
  mapQuery: string;
  coordinates: { x: number; y: number }; // percentage on map overlay
  reportedDate: string;
  status: 'Reported' | 'Under Review' | 'In Progress' | 'Resolved';
  statusColor: string; // #3B82F6, #F59E0B, #22C55E, #EF4444
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  department: string;
  assignedOfficer?: string;
  estimatedFixTime?: string;
  description: string;
  upvotes: number;
  timeline: {
    step: string;
    date: string;
    completed: boolean;
    current?: boolean;
    note?: string;
  }[];
}

export const HERO_MAP_ISSUES: CivicIssue[] = [
  {
    id: 'issue-1',
    trackingId: 'CF-2026-0012',
    title: 'Large Pothole on Main Road',
    category: 'Roads & Potholes',
    location: 'FC Road (Fergusson College Rd), Shivajinagar, Pune',
    mapQuery: 'FC+Road+Shivajinagar+Pune',
    coordinates: { x: 38, y: 46 },
    reportedDate: '18 Sept 2026',
    status: 'In Progress',
    statusColor: '#F59E0B',
    priority: 'High',
    department: 'Pune Municipal Corporation (PMC Road Works)',
    assignedOfficer: 'Er. V. S. Kulkarni (Road Div. 3 - Shivajinagar)',
    estimatedFixTime: '48 Hours',
    description: 'Deep road depression near Goodluck Cafe square posing risk to two-wheelers and night traffic.',
    upvotes: 3,
    timeline: [
      { step: 'Report Submitted', date: '18 Sept, 09:15 AM', completed: true },
      { step: 'Issue Verified', date: '18 Sept, 11:30 AM', completed: true, note: 'AI image verified & location geofenced' },
      { step: 'Repair Team Assigned', date: '19 Sept, 08:45 AM', completed: true, current: true, note: 'PMC quick-mix asphalt team en route' },
      { step: 'Issue Resolved', date: 'Pending completion', completed: false },
    ],
  },
  {
    id: 'issue-2',
    trackingId: 'CF-2026-0008',
    title: 'Broken High-Mast Streetlight',
    category: 'Street Lighting',
    location: 'Viman Nagar Junction, Pune, Maharashtra',
    mapQuery: 'Viman+Nagar+Pune',
    coordinates: { x: 74, y: 32 },
    reportedDate: '17 Sept 2026',
    status: 'In Progress',
    statusColor: '#F59E0B',
    priority: 'Medium',
    department: 'PMC Electrical & Public Lighting Bureau',
    assignedOfficer: 'S. Patil (Ward 14 Electric Inspector)',
    estimatedFixTime: 'Today by 6 PM',
    description: '4-lamp high-mast flicker causing blind spot near neighborhood school pedestrian crossing.',
    upvotes: 2,
    timeline: [
      { step: 'Report Submitted', date: '17 Sept, 07:20 PM', completed: true },
      { step: 'Issue Verified', date: '18 Sept, 09:00 AM', completed: true },
      { step: 'Repair Team Assigned', date: '18 Sept, 02:15 PM', completed: true, current: true },
      { step: 'Issue Resolved', date: 'Estimated 20 Sept', completed: false },
    ],
  },
  {
    id: 'issue-3',
    trackingId: 'CF-2026-0005',
    title: 'Overflowing Waste Bin at Market',
    category: 'Sanitation & Waste',
    location: 'Mandai / Tulshibaug Market Area, Pune',
    mapQuery: 'Mahatma+Phule+Mandai+Pune',
    coordinates: { x: 44, y: 68 },
    reportedDate: '19 Sept 2026',
    status: 'Under Review',
    statusColor: '#3B82F6',
    priority: 'Critical',
    department: 'PMC Solid Waste Management Cell',
    assignedOfficer: 'Awaiting Dispatch',
    description: 'Market entrance dump bin overflowing — sanitation team notified and awaiting dispatch.',
    upvotes: 4,
    timeline: [
      { step: 'Report Submitted', date: '19 Sept, 06:10 AM', completed: true },
      { step: 'Issue Verified', date: '19 Sept, 07:00 AM', completed: true, current: true },
      { step: 'Repair Team Assigned', date: 'Pending', completed: false },
      { step: 'Issue Resolved', date: 'Pending', completed: false },
    ],
  },
  {
    id: 'issue-4',
    trackingId: 'CF-2026-0017',
    title: 'Major Water Pipeline Leakage',
    category: 'Water & Drainage',
    location: 'Kothrud (near Karve Statue), Pune',
    mapQuery: 'Kothrud+Pune',
    coordinates: { x: 26, y: 62 },
    reportedDate: '20 Sept 2026',
    status: 'Reported',
    statusColor: '#3B82F6',
    priority: 'High',
    department: 'PMC Water Supply & Jal Sansthan',
    assignedOfficer: 'Awaiting Dispatch',
    description: 'Continuous clean water gushing onto pavement from main supply distribution valve line.',
    upvotes: 1,
    timeline: [
      { step: 'Report Submitted', date: '20 Sept, 02:40 PM', completed: true, current: true },
      { step: 'Issue Verified', date: 'Under automated dispatch', completed: false },
      { step: 'Repair Team Assigned', date: 'Pending review', completed: false },
      { step: 'Issue Resolved', date: 'Pending', completed: false },
    ],
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Spot',
    subtitle: 'Notice a problem in your neighborhood.',
    detail: 'Whether it is a sudden pothole, dark street, leaking pipe, or uncleared waste heap, identify issues affecting your community safety.',
    iconName: 'Eye',
  },
  {
    number: '02',
    title: 'Report',
    subtitle: 'Upload a photo, location, and short description.',
    detail: 'Snap a quick photo with automatic GPS geo-tagging and submit in under 30 seconds with no complex bureaucratic paperwork.',
    iconName: 'Camera',
  },
  {
    number: '03',
    title: 'Track',
    subtitle: 'Follow your report as it moves through the resolution process.',
    detail: 'Receive live stage notifications as the ticket is verified, assigned to the specific municipal engineer, and dispatched for repair.',
    iconName: 'Compass',
  },
  {
    number: '04',
    title: 'Resolve',
    subtitle: 'Authorities address the issue and update its status.',
    detail: 'Inspect before-and-after photo verification uploaded by field crews, rate the repair quality, and keep municipal teams accountable.',
    iconName: 'CheckCircle2',
  },
];

export const FEATURES = [
  {
    id: 'easy-reporting',
    icon: 'FileText',
    title: 'Easy Issue Reporting',
    description: 'Report problems effortlessly with high-res photos, descriptions, and automated category matching in seconds.',
    tag: 'Instant Submit',
  },
  {
    id: 'location-reporting',
    icon: 'MapPin',
    title: 'Location-Based Reporting',
    description: 'Automatically pin exact GPS coordinates and ward boundaries to prevent jurisdictional confusion.',
    tag: 'Auto Geotag',
  },
  {
    id: 'realtime-tracking',
    icon: 'Activity',
    title: 'Real-Time Tracking',
    description: 'Transparently monitor if an issue is Reported, Under Review, In Progress, or Resolved by authorities.',
    tag: 'Live Timeline',
  },
  {
    id: 'status-alerts',
    icon: 'Bell',
    title: 'Status Notifications',
    description: 'Get real-time SMS, WhatsApp, and browser updates whenever field officers take action or log progress.',
    tag: 'Instant Alerts',
  },
  {
    id: 'community-visibility',
    icon: 'Users',
    title: 'Community Visibility',
    description: 'See civic issues reported around your neighborhood, upvote critical concerns, and avoid duplicate filings.',
    tag: 'Civic Feed',
  },
  {
    id: 'authority-coordination',
    icon: 'Building2',
    title: 'Authority Coordination',
    description: 'Directly routes complaints to the exact nodal department — whether municipal works, electricity, or water.',
    tag: 'Smart Dispatch',
  },
];

export const COMPARISON_POINTS = [
  {
    aspect: 'Complaint Submission',
    traditional: 'Physical visits, confusing paper forms, or inactive email inboxes',
    civicFix: '30-second mobile & web report with instant GPS and photo upload',
  },
  {
    aspect: 'Progress Visibility',
    traditional: 'Black box with zero status feedback or estimated resolution dates',
    civicFix: 'Live step-by-step progress tracker with assigned officer credentials',
  },
  {
    aspect: 'Accountability',
    traditional: 'Frequent buck-passing between overlapping civic departments',
    civicFix: 'Automated algorithmic routing directly to the responsible nodal body',
  },
  {
    aspect: 'Community Voice',
    traditional: 'Individual citizen complaints are easily deprioritized or ignored',
    civicFix: 'Neighborhood upvoting highlights urgent safety hazards publicly',
  },
  {
    aspect: 'Proof of Resolution',
    traditional: 'Tickets closed unilaterally without photographic proof',
    civicFix: 'Mandatory field crew before-and-after photo verification + citizen sign-off',
  },
];

export const IMPACT_STATISTICS = [
  { value: '7', label: 'Issues Reported', change: 'Growing this week' },
  { value: '0', label: 'Issues Resolved', change: 'Resolutions pending' },
  { value: '0', label: 'Wards Connected', change: 'Connecting soon' },
  { value: '0%', label: 'Resolution Rate', change: 'Early stage platform' },
];
