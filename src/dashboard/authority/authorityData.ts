export interface AuthorityComplaint {
  id: string;
  trackingId: string;
  title: string;
  location: string;
  ward: string;
  category: 'Roads' | 'Streetlights' | 'Waste' | 'Water' | 'Drainage' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  department: 'Roads & Infrastructure' | 'Sanitation' | 'Water Department' | 'Electrical' | 'Public Works';
  assignedTo: string;
  status: 'New' | 'Pending Verification' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected' | 'Overdue';
  date: string;
  reportedAgo: string;
  citizenName: string;
  citizenPhone: string;
  description: string;
  lat: number;
  lng: number;
}

export const INITIAL_AUTHORITY_COMPLAINTS: AuthorityComplaint[] = [
  {
    id: 'comp-101',
    trackingId: 'CF-2026-10482',
    title: 'Large Pothole on Main Road',
    location: 'MG Road, Camp Area, Pune',
    ward: 'Ward 14 - Camp Zone',
    category: 'Roads',
    priority: 'High',
    department: 'Roads & Infrastructure',
    assignedTo: 'Eng. Rajesh Deshmukh',
    status: 'In Progress',
    date: '18 Sep 2026',
    reportedAgo: '4 hours ago',
    citizenName: 'Aarav Deshmukh',
    citizenPhone: '+91 98765 43210',
    description: 'Deep pothole causing traffic slowdown near MG Road signal. Water accumulation inside.',
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    id: 'comp-102',
    trackingId: 'CF-2026-10476',
    title: 'Broken Streetlight Poles',
    location: 'Koregaon Park Lane 7, Pune',
    ward: 'Ward 08 - Koregaon Park',
    category: 'Streetlights',
    priority: 'Medium',
    department: 'Electrical',
    assignedTo: 'Electrical Team B',
    status: 'Pending Verification',
    date: '18 Sep 2026',
    reportedAgo: '6 hours ago',
    citizenName: 'Priya Nair',
    citizenPhone: '+91 98123 45678',
    description: 'Multiple streetlights unlit along Lane 7, creating safety concerns at night.',
    lat: 18.5362,
    lng: 73.8940,
  },
  {
    id: 'comp-103',
    trackingId: 'CF-2026-10465',
    title: 'Garbage Overflow near Market',
    location: 'Mandai Market, Shukrawar Peth, Pune',
    ward: 'Ward 11 - Peth Zone',
    category: 'Waste',
    priority: 'High',
    department: 'Sanitation',
    assignedTo: 'Sanitation Inspector Kulkarni',
    status: 'Pending Verification',
    date: '17 Sep 2026',
    reportedAgo: '1 day ago',
    citizenName: 'Sunil Joshi',
    citizenPhone: '+91 97654 32109',
    description: 'Overloaded community trash container spilling onto pedestrian walkway.',
    lat: 18.5126,
    lng: 73.8553,
  },
  {
    id: 'comp-104',
    trackingId: 'CF-2026-10451',
    title: 'Major Water Pipeline Leakage',
    location: 'DP Road, Aundh, Pune',
    ward: 'Ward 03 - Aundh Zone',
    category: 'Water',
    priority: 'Critical',
    department: 'Water Department',
    assignedTo: 'Rapid Water Response Unit',
    status: 'In Progress',
    date: '16 Sep 2026',
    reportedAgo: '2 days ago',
    citizenName: 'Vikram Mehta',
    citizenPhone: '+91 99887 76655',
    description: 'High-pressure water main leaking continuously onto main DP Road road surface.',
    lat: 18.5580,
    lng: 73.8077,
  },
  {
    id: 'comp-105',
    trackingId: 'CF-2026-10440',
    title: 'Clogged Stormwater Drain',
    location: 'FC Road, Shivajinagar, Pune',
    ward: 'Ward 12 - Shivajinagar',
    category: 'Drainage',
    priority: 'High',
    department: 'Public Works',
    assignedTo: 'Drainage Crew Alpha',
    status: 'Assigned',
    date: '19 Sep 2026',
    reportedAgo: '2 hours ago',
    citizenName: 'Neha Shinde',
    citizenPhone: '+91 96543 21098',
    description: 'Drain inlet blocked with dry leaves and silt, causing puddle overflow.',
    lat: 18.5284,
    lng: 73.8415,
  },
  {
    id: 'comp-106',
    trackingId: 'CF-2026-10432',
    title: 'Hazardous Overhead Cable',
    location: 'Viman Nagar Main Road, Pune',
    ward: 'Ward 06 - Viman Nagar',
    category: 'Other',
    priority: 'Critical',
    department: 'Electrical',
    assignedTo: 'Emergency Power Wing',
    status: 'New',
    date: '20 Sep 2026',
    reportedAgo: '45 mins ago',
    citizenName: 'Anil Agarwal',
    citizenPhone: '+91 95432 10987',
    description: 'Dangling electrical/telecom wire hanging low near bus stop.',
    lat: 18.5679,
    lng: 73.9143,
  },
  {
    id: 'comp-107',
    trackingId: 'CF-2026-10425',
    title: 'Public Park Light Malfunction',
    location: 'Chhatrapati Sambhaji Garden, JM Road, Pune',
    ward: 'Ward 12 - Shivajinagar',
    category: 'Streetlights',
    priority: 'Low',
    department: 'Electrical',
    assignedTo: 'Garden Maintenance Dept',
    status: 'Verified',
    date: '19 Sep 2026',
    reportedAgo: '1 day ago',
    citizenName: 'Smita Kulkarni',
    citizenPhone: '+91 94321 09876',
    description: 'Solar park lights dimming out prematurely at 8 PM.',
    lat: 18.5215,
    lng: 73.8478,
  }
];

export const AUTHORITY_STATS = {
  totalComplaints: '7',
  totalTrend: '7 total reported',
  newToday: '2',
  inProgress: '0',
  resolved: '0',
  overdue: '0',
  pendingVerification: '5',
};

export const DEPARTMENT_PERFORMANCE_DATA = [
  {
    name: 'Roads & Infrastructure',
    resolvedPercent: 0,
    avgDays: 'Pending',
    openCount: 2,
    icon: 'Road',
    color: '#3B82F6'
  },
  {
    name: 'Sanitation',
    resolvedPercent: 0,
    avgDays: 'Pending',
    openCount: 1,
    icon: 'Trash2',
    color: '#22C55E'
  },
  {
    name: 'Water Department',
    resolvedPercent: 0,
    avgDays: 'Pending',
    openCount: 2,
    icon: 'Droplets',
    color: '#0EA5E9'
  },
  {
    name: 'Electrical',
    resolvedPercent: 0,
    avgDays: 'Pending',
    openCount: 2,
    icon: 'Zap',
    color: '#F59E0B'
  }
];

export const AUTHORITY_NOTIFICATIONS = [
  {
    id: 'n-1',
    type: 'critical',
    title: 'Critical complaint received',
    desc: 'Water pipeline leakage reported on DP Road, Aundh requiring immediate dispatch.',
    time: '12 mins ago',
    read: false,
  },
  {
    id: 'n-2',
    type: 'info',
    title: 'New complaints batch',
    desc: '7 new complaints received in Pune jurisdiction across wards.',
    time: '2 hours ago',
    read: true,
  }
];

export const AUTHORITY_ACTIVITY_LOG = [
  {
    id: 'act-1',
    text: 'Complaint CF-2026-10482 assigned to Road Maintenance Crew',
    time: '5 minutes ago',
    type: 'assignment'
  },
  {
    id: 'act-2',
    text: '7 total complaints logged across Pune municipal zones',
    time: '42 minutes ago',
    type: 'incoming'
  }
];
