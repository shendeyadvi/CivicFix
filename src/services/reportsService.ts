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

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  duplicateCount: number;
  isCertainMatch: boolean;
  matchReason?: string;
  existingReport?: {
    id: string;
    trackingId: string;
    title: string;
    category: string;
    location: string;
    status: string;
    distanceMeters: number;
    upvotes: number;
    imageUrl?: string;
    date?: string;
    reportedAgo?: string;
    description?: string;
  };
}

export type AddReportResponse =
  | { type: 'created'; report: CivicReportItem }
  | { type: 'duplicate'; duplicateInfo: DuplicateCheckResult };

// In-memory cache for ultra-responsive UI renders
let memoryCache: CivicReportItem[] = [];
let isInitialized = false;

export class ReportsService {
  // Synchronous getter from in-memory cache (safe for immediate component render)
  public static getReports(): CivicReportItem[] {
    return memoryCache;
  }

  private static notifyChange(reports: CivicReportItem[]) {
    memoryCache = reports;
    window.dispatchEvent(new CustomEvent('civicfix_reports_updated', { detail: reports }));
  }

  // Fetch all reports from the real backend API
  public static async loadReports(): Promise<CivicReportItem[]> {
    return this.fetchReports();
  }

  public static async fetchReports(): Promise<CivicReportItem[]> {
    try {
      const reports = await ApiClient.get<CivicReportItem[]>('/api/reports');
      if (Array.isArray(reports)) {
        this.notifyChange(reports);
        return reports;
      }
    } catch (err) {
      console.warn('Backend /api/reports unavailable:', err);
    }
    return memoryCache;
  }

  // Submit a new civic report to the backend database with duplicate detection
  public static async addReport(
    report: Partial<CivicReportItem> & { forceNew?: boolean }
  ): Promise<AddReportResponse> {
    const response = await ApiClient.post<any>('/api/reports', report);
    if (response?.potentialDuplicate) {
      return {
        type: 'duplicate',
        duplicateInfo: response,
      };
    }
    if (!response || !response.report) {
      throw new Error('Backend failed to create report record in database.');
    }
    await this.fetchReports(); // Refresh global list from PostgreSQL database
    return {
      type: 'created',
      report: response.report,
    };
  }

  // Support an existing complaint (records support in PostgreSQL, increments support count)
  public static async supportReport(idOrTrackingId: string): Promise<{
    alreadySupported: boolean;
    message: string;
    report: CivicReportItem;
  }> {
    const res = await ApiClient.post<{
      alreadySupported: boolean;
      message: string;
      report: CivicReportItem;
    }>(`/api/reports/${encodeURIComponent(idOrTrackingId)}/support`);
    await this.fetchReports();
    return res;
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
  public static async checkDuplicate(params: {
    category: string;
    lat: number;
    lng: number;
    title?: string;
    description?: string;
    imageUrl?: string;
    radiusMeters?: number;
  }): Promise<DuplicateCheckResult> {
    try {
      return await ApiClient.post<DuplicateCheckResult>('/api/reports/check-duplicate', params);
    } catch {
      return { isDuplicate: false, confidence: 0, duplicateCount: 0, isCertainMatch: false };
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
      try {
        const formData = new FormData();
        formData.append('image', imagePayload.file);
        if (imagePayload.hint) formData.append('hint', imagePayload.hint);
        const response = await ApiClient.post<{ success: boolean; data: AIAnalysisResponse }>('/api/ai/analyze-image', formData);
        return response.data;
      } catch (err: any) {
        if (imagePayload.base64) {
          console.warn('Multipart upload failed, attempting base64 payload fallback:', err?.message);
          const response = await ApiClient.post<{ success: boolean; data: AIAnalysisResponse }>('/api/ai/analyze-image', {
            base64: imagePayload.base64,
            hint: imagePayload.hint,
          });
          return response.data;
        }
        throw err;
      }
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
    localStorage.removeItem('civicfix_reports_data');
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
