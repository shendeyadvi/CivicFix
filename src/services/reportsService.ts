export interface CivicReportItem {
  id: string;
  trackingId: string;
  title: string;
  category: string;
  location: string;
  ward: string;
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
  upvotes: number;
}

const STORAGE_KEY = 'civicfix_reports_data';

export const INITIAL_SEED_REPORTS: CivicReportItem[] = [
  {
    id: 'rep-101',
    trackingId: 'CF-2026-10482',
    title: 'Large Pothole on Main Road',
    category: 'Roads & Potholes',
    location: 'MG Road, Camp Area, Pune',
    ward: 'Ward 14 - Camp Zone',
    priority: 'High',
    department: 'Roads & Infrastructure',
    assignedTo: 'Eng. Rajesh Deshmukh',
    status: 'Pending Verification',
    date: '18 Sep 2026',
    reportedAgo: '4 hours ago',
    citizenName: 'Aarav Deshmukh',
    citizenPhone: '+91 98765 43210',
    description: 'Deep pothole causing traffic slowdown near MG Road signal. Water accumulation inside.',
    lat: 18.5204,
    lng: 73.8567,
    upvotes: 3,
  },
  {
    id: 'rep-102',
    trackingId: 'CF-2026-10476',
    title: 'Broken Streetlight Poles',
    category: 'Street Lighting',
    location: 'Koregaon Park Lane 7, Pune',
    ward: 'Ward 08 - Koregaon Park',
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
    upvotes: 2,
  },
  {
    id: 'rep-103',
    trackingId: 'CF-2026-10465',
    title: 'Garbage Overflow near Market',
    category: 'Sanitation & Waste',
    location: 'Mandai Market, Shukrawar Peth, Pune',
    ward: 'Ward 11 - Peth Zone',
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
    upvotes: 4,
  },
  {
    id: 'rep-104',
    trackingId: 'CF-2026-10451',
    title: 'Major Water Pipeline Leakage',
    category: 'Water & Drainage',
    location: 'DP Road, Aundh, Pune',
    ward: 'Ward 03 - Aundh Zone',
    priority: 'Critical',
    department: 'Water Department',
    assignedTo: 'Rapid Water Response Unit',
    status: 'Pending Verification',
    date: '16 Sep 2026',
    reportedAgo: '2 days ago',
    citizenName: 'Vikram Mehta',
    citizenPhone: '+91 99887 76655',
    description: 'High-pressure water main leaking continuously onto main DP Road road surface.',
    lat: 18.5580,
    lng: 73.8077,
    upvotes: 5,
  },
  {
    id: 'rep-105',
    trackingId: 'CF-2026-10440',
    title: 'Clogged Stormwater Drain',
    category: 'Water & Drainage',
    location: 'FC Road, Shivajinagar, Pune',
    ward: 'Ward 12 - Shivajinagar',
    priority: 'High',
    department: 'Public Works',
    assignedTo: 'Drainage Crew Alpha',
    status: 'Pending Verification',
    date: '19 Sep 2026',
    reportedAgo: '2 hours ago',
    citizenName: 'Neha Shinde',
    citizenPhone: '+91 96543 21098',
    description: 'Drain inlet blocked with dry leaves and silt, causing puddle overflow.',
    lat: 18.5284,
    lng: 73.8415,
    upvotes: 1,
  },
  {
    id: 'rep-106',
    trackingId: 'CF-2026-10432',
    title: 'Hazardous Overhead Cable',
    category: 'Public Safety',
    location: 'Viman Nagar Main Road, Pune',
    ward: 'Ward 06 - Viman Nagar',
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
    upvotes: 2,
  },
  {
    id: 'rep-107',
    trackingId: 'CF-2026-10425',
    title: 'Public Park Light Malfunction',
    category: 'Street Lighting',
    location: 'Chhatrapati Sambhaji Garden, JM Road, Pune',
    ward: 'Ward 12 - Shivajinagar',
    priority: 'Low',
    department: 'Electrical',
    assignedTo: 'Garden Maintenance Dept',
    status: 'Pending Verification',
    date: '19 Sep 2026',
    reportedAgo: '1 day ago',
    citizenName: 'Smita Kulkarni',
    citizenPhone: '+91 94321 09876',
    description: 'Solar park lights dimming out prematurely at 8 PM.',
    lat: 18.5215,
    lng: 73.8478,
    upvotes: 3,
  }
];

export class ReportsService {
  public static getReports(): CivicReportItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: CivicReportItem[] = JSON.parse(data);
        // Sanitize any legacy seed items with 'In Progress' to 'Pending Verification'
        const sanitized = parsed.map((item) =>
          item.status === 'In Progress' ? { ...item, status: 'Pending Verification' as const } : item
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        return sanitized;
      }
    } catch {
      // Fallback if localStorage fails
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REPORTS));
    return INITIAL_SEED_REPORTS;
  }

  private static notifyChange() {
    try {
      window.dispatchEvent(new CustomEvent('civicfix_reports_updated'));
    } catch {
      // Ignore in non-browser environment
    }
  }

  public static addReport(report: Partial<CivicReportItem>): CivicReportItem {
    const reports = this.getReports();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `CF-2026-${randomNum}`;
    
    // Map category to department
    let department: CivicReportItem['department'] = 'Roads & Infrastructure';
    const cat = report.category || 'Roads & Potholes';
    if (cat.includes('Light')) department = 'Electrical';
    else if (cat.includes('Waste') || cat.includes('Sanitation')) department = 'Sanitation';
    else if (cat.includes('Water') || cat.includes('Drain')) department = 'Water Department';
    else if (cat.includes('Safety') || cat.includes('Infra')) department = 'Public Works';

    const newReport: CivicReportItem = {
      id: `rep-${Date.now()}`,
      trackingId,
      title: report.title || 'Civic Complaint',
      category: cat,
      location: report.location || 'FC Road, Shivajinagar, Pune',
      ward: 'Ward 12 - Shivajinagar',
      priority: report.priority || 'Medium',
      department,
      assignedTo: 'PMC Nodal Officer',
      status: 'New',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reportedAgo: 'Just now',
      citizenName: report.citizenName || 'Aarav Deshmukh',
      citizenPhone: '+91 98765 43210',
      description: report.description || 'Citizen reported issue via CivicFix AI app.',
      lat: 18.5204 + (Math.random() * 0.04 - 0.02),
      lng: 73.8567 + (Math.random() * 0.04 - 0.02),
      upvotes: 1,
    };

    const updated = [newReport, ...reports];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Handle storage exception
    }
    this.notifyChange();
    return newReport;
  }

  public static deleteReport(idOrTrackingId: string): boolean {
    const reports = this.getReports();
    const updated = reports.filter((r) => r.id !== idOrTrackingId && r.trackingId !== idOrTrackingId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      this.notifyChange();
      return true;
    } catch {
      return false;
    }
  }

  public static updateStatus(trackingId: string, newStatus: CivicReportItem['status']): boolean {
    const reports = this.getReports();
    const updated = reports.map((r) =>
      r.trackingId === trackingId || r.id === trackingId ? { ...r, status: newStatus } : r
    );
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      this.notifyChange();
      return true;
    } catch {
      return false;
    }
  }
}
