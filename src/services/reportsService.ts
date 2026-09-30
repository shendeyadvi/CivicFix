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

export interface AIAnalysisResponse {
  isRelevant: boolean;
  confidence: number;
  reason?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  department?: string;
  description?: string;
  tags?: string[];
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
        await this.fetchReports(); // Refresh global list from database
        return response.report;
      }
      throw new Error('Invalid response received from server.');
    } catch (err: any) {
      console.error('Backend report submission failed:', err);
      throw new Error(err?.message || 'Unable to connect to CivicFix server. Your report was not submitted.');
    }
  }

  // Track report by ticket tracking ID from backend database
  public static async trackReport(trackingId: string): Promise<CivicReportItem | null> {
    try {
      const data = await ApiClient.get<CivicReportItem>(`/api/reports/track/${encodeURIComponent(trackingId)}`);
      return data;
    } catch {
      return null;
    }
  }

  // Delete report from backend database
  public static async deleteReport(idOrTrackingId: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/api/reports/${encodeURIComponent(idOrTrackingId)}`);
      await this.fetchReports();
      return true;
    } catch (err) {
      console.error('Delete report error:', err);
      throw err;
    }
  }

  // Update report status (Official action)
  public static async updateStatus(trackingId: string, newStatus: CivicReportItem['status']): Promise<boolean> {
    try {
      await ApiClient.patch(`/api/reports/${encodeURIComponent(trackingId)}/status`, { status: newStatus });
      await this.fetchReports();
      return true;
    } catch (err) {
      console.error('Update status error:', err);
      throw err;
    }
  }

  // Reassign department
  public static async assignDepartment(trackingId: string, department: string): Promise<boolean> {
    try {
      await ApiClient.patch(`/api/reports/${encodeURIComponent(trackingId)}/department`, { department });
      await this.fetchReports();
      return true;
    } catch (err) {
      console.error('Assign department error:', err);
      throw err;
    }
  }

  // Upvote report
  public static async upvoteReport(id: string): Promise<{ upvoted: boolean; upvotes: number }> {
    try {
      const res = await ApiClient.post<{ upvoted: boolean; upvotes: number }>(`/api/reports/${encodeURIComponent(id)}/upvote`);
      await this.fetchReports();
      return res;
    } catch (err) {
      console.error('Upvote error:', err);
      throw err;
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
  public static async analyzeImage(imagePayload: {
    file?: File;
    base64?: string;
    imageUrl?: string;
    hint?: string;
  }): Promise<AIAnalysisResponse> {
    if (imagePayload.file) {
      const formData = new FormData();
      formData.append('image', imagePayload.file);
      if (imagePayload.hint) formData.append('hint', imagePayload.hint);
      const response = await ApiClient.post<{ success: boolean; data: AIAnalysisResponse }>('/api/ai/analyze-image', formData);
      return response.data;
    } else if (imagePayload.base64) {
      const response = await ApiClient.post<{ success: boolean; data: AIAnalysisResponse }>('/api/ai/analyze-image', {
        base64: imagePayload.base64,
        hint: imagePayload.hint,
      });
      return response.data;
    } else if (imagePayload.imageUrl) {
      const response = await ApiClient.post<{ success: boolean; data: AIAnalysisResponse }>('/api/ai/analyze-image', {
        imageUrl: imagePayload.imageUrl,
        hint: imagePayload.hint,
      });
      return response.data;
    }
    throw new Error('No image provided for AI analysis.');
  }
}

// Auto-initialize data and background multi-device synchronization
if (typeof window !== 'undefined' && !isInitialized) {
  isInitialized = true;

  // Clear legacy mock reports if lingering in browser cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && (raw.includes('rep-101') || raw.includes('rep-102') || raw.includes('rep-103'))) {
      localStorage.removeItem(STORAGE_KEY);
      memoryCache = [];
    }
  } catch {
    // ignore
  }

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
