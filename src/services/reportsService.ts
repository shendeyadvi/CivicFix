import { ApiClient } from './apiClient';

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
  image?: string;
  timeline?: {
    step: string;
    date: string;
    completed: boolean;
    current?: boolean;
    note?: string;
  }[];
}

const STORAGE_KEY = 'civicfix_reports_data';

// In-memory cache for ultra-responsive UI renders
let memoryCache: CivicReportItem[] = [];
let isInitialized = false;

export class ReportsService {
  // Synchronous getter from cache / storage (safe for immediate component render)
  public static getReports(): CivicReportItem[] {
    if (memoryCache.length > 0) {
      return memoryCache;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        memoryCache = JSON.parse(data);
        return memoryCache;
      }
    } catch {
      // ignore
    }
    return [];
  }

  private static notifyChange(reports: CivicReportItem[]) {
    memoryCache = reports;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      window.dispatchEvent(new CustomEvent('civicfix_reports_updated', { detail: reports }));
    } catch {
      // ignore
    }
  }

  // Fetch all reports from the real backend API
  public static async fetchReports(): Promise<CivicReportItem[]> {
    try {
      const reports = await ApiClient.get<CivicReportItem[]>('/api/reports');
      if (Array.isArray(reports)) {
        this.notifyChange(reports);
        return reports;
      }
    } catch (err) {
      console.warn('Backend /api/reports unavailable, using local cache:', err);
    }
    return this.getReports();
  }

  // Submit a new civic report to the backend database
  public static async addReport(report: Partial<CivicReportItem>): Promise<CivicReportItem> {
    try {
      const response = await ApiClient.post<{ message: string; report: CivicReportItem }>('/api/reports', report);
      if (response && response.report) {
        await this.fetchReports(); // Refresh global list
        return response.report;
      }
    } catch (err) {
      console.warn('Backend report submission failed, saving locally:', err);
    }

    // Fallback local creation if backend temporarily offline
    const reports = this.getReports();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `CF-2026-${randomNum}`;

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
      ward: report.ward || 'Ward 12 - Shivajinagar',
      priority: report.priority || 'Medium',
      department,
      assignedTo: 'PMC Nodal Officer',
      status: 'New',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reportedAgo: 'Just now',
      citizenName: report.citizenName || 'Aarav Deshmukh',
      citizenPhone: report.citizenPhone || '+91 98765 43210',
      description: report.description || 'Citizen reported issue via CivicFix app.',
      lat: report.lat || 18.5204 + (Math.random() * 0.04 - 0.02),
      lng: report.lng || 73.8567 + (Math.random() * 0.04 - 0.02),
      upvotes: 1,
      image: report.image,
      timeline: [
        { step: 'Report Submitted', date: 'Today', completed: true },
        { step: 'AI Issue Verification', date: 'Pending', completed: false, current: true },
        { step: 'Team Assignment', date: 'Pending', completed: false },
        { step: 'Issue Resolved', date: 'Pending', completed: false },
      ],
    };

    const updated = [newReport, ...reports];
    this.notifyChange(updated);
    return newReport;
  }

  // Track report by ticket tracking ID from backend database
  public static async trackReport(trackingId: string): Promise<CivicReportItem | null> {
    try {
      const data = await ApiClient.get<CivicReportItem>(`/api/reports/track/${encodeURIComponent(trackingId)}`);
      return data;
    } catch {
      // Fallback search in local cache
      const reports = this.getReports();
      const q = trackingId.toUpperCase().trim();
      return reports.find((r) => r.trackingId.toUpperCase() === q || r.id === trackingId) || null;
    }
  }

  // Delete report
  public static async deleteReport(idOrTrackingId: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/api/reports/${encodeURIComponent(idOrTrackingId)}`);
      await this.fetchReports();
      return true;
    } catch {
      const reports = this.getReports();
      const updated = reports.filter((r) => r.id !== idOrTrackingId && r.trackingId !== idOrTrackingId);
      this.notifyChange(updated);
      return true;
    }
  }

  // Update report status (Official action)
  public static async updateStatus(trackingId: string, newStatus: CivicReportItem['status']): Promise<boolean> {
    try {
      await ApiClient.patch(`/api/reports/${encodeURIComponent(trackingId)}/status`, { status: newStatus });
      await this.fetchReports();
      return true;
    } catch {
      const reports = this.getReports();
      const updated = reports.map((r) =>
        r.trackingId === trackingId || r.id === trackingId ? { ...r, status: newStatus } : r
      );
      this.notifyChange(updated);
      return true;
    }
  }

  // Reassign department
  public static async assignDepartment(trackingId: string, department: string): Promise<boolean> {
    try {
      await ApiClient.patch(`/api/reports/${encodeURIComponent(trackingId)}/department`, { department });
      await this.fetchReports();
      return true;
    } catch {
      const reports = this.getReports();
      const updated = reports.map((r) =>
        r.trackingId === trackingId || r.id === trackingId ? { ...r, department: department as any, status: 'Assigned' as const } : r
      );
      this.notifyChange(updated);
      return true;
    }
  }

  // Upvote report
  public static async upvoteReport(id: string): Promise<{ upvoted: boolean; upvotes: number }> {
    try {
      return await ApiClient.post<{ upvoted: boolean; upvotes: number }>(`/api/reports/${encodeURIComponent(id)}/upvote`);
    } catch {
      const reports = this.getReports();
      let upvotes = 1;
      const updated = reports.map((r) => {
        if (r.id === id || r.trackingId === id) {
          upvotes = r.upvotes + 1;
          return { ...r, upvotes };
        }
        return r;
      });
      this.notifyChange(updated);
      return { upvoted: true, upvotes };
    }
  }

  // Check duplicate report in proximity
  public static async checkDuplicate(category: string, lat: number, lng: number, title?: string) {
    try {
      return await ApiClient.post<{
        isDuplicate: boolean;
        confidence: number;
        duplicateCount: number;
        existingReport?: {
          id: string;
          trackingId: string;
          title: string;
          category: string;
          location: string;
          status: string;
          distanceMeters: number;
        };
      }>('/api/reports/check-duplicate', { category, lat, lng, title });
    } catch {
      return { isDuplicate: false, confidence: 0, duplicateCount: 0 };
    }
  }

  // AI Multimodal Vision Analysis
  public static async analyzeImage(imagePayload: { file?: File; base64?: string; hint?: string }) {
    try {
      if (imagePayload.file) {
        const formData = new FormData();
        formData.append('image', imagePayload.file);
        if (imagePayload.hint) formData.append('hint', imagePayload.hint);
        const response = await ApiClient.post<{ success: boolean; data: any }>('/api/ai/analyze-image', formData);
        return response.data;
      } else if (imagePayload.base64) {
        const response = await ApiClient.post<{ success: boolean; data: any }>('/api/ai/analyze-image', {
          base64: imagePayload.base64,
          hint: imagePayload.hint,
        });
        return response.data;
      }
    } catch (err) {
      console.warn('Backend AI analysis unavailable, using fallback diagnostic:', err);
    }
    return null;
  }
}

// Auto-initialize data and background multi-device synchronization
if (typeof window !== 'undefined' && !isInitialized) {
  isInitialized = true;
  ReportsService.fetchReports();

  // Poll backend every 4 seconds to sync multi-user updates automatically across devices
  setInterval(() => {
    ReportsService.fetchReports();
  }, 4000);

  // Sync on window focus
  window.addEventListener('focus', () => {
    ReportsService.fetchReports();
  });
}
