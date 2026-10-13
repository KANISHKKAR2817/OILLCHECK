import {
  AuthResponse, User, ScanDetail, ScanSummary, MedicineReferenceDetail,
  SuspiciousReport, DashboardSummary, DashboardAnalytics, SystemHealth,
  CsvPreviewResponse
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('pillcheck_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Clear token on auth failure
      localStorage.removeItem('pillcheck_token');
      localStorage.removeItem('pillcheck_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    if (!res.ok) {
      let errorMessage = 'An error occurred during request execution';
      try {
        const errorJson = await res.json();
        errorMessage = errorJson.detail || errorJson.message || errorMessage;
      } catch (e) {
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // --- Auth ---
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('pillcheck_token', data.access_token);
    localStorage.setItem('pillcheck_user', JSON.stringify(data.user));
    return data;
  }

  async register(details: { email: string; password: string; full_name: string; role?: string }): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    });
    localStorage.setItem('pillcheck_token', data.access_token);
    localStorage.setItem('pillcheck_user', JSON.stringify(data.user));
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('pillcheck_token');
      localStorage.removeItem('pillcheck_user');
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(updates: { full_name?: string; email?: string; current_password?: string; new_password?: string }): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // --- Scans ---
  async createScan(formData: FormData): Promise<ScanDetail> {
    return this.request<ScanDetail>('/scans', {
      method: 'POST',
      body: formData,
    });
  }

  async getScan(scanId: string): Promise<ScanDetail> {
    return this.request<ScanDetail>(`/scans/${scanId}`);
  }

  async getScanStatus(scanId: string): Promise<{ status: string; overall_risk_band: string; risk_score: number }> {
    return this.request(`/scans/${scanId}/status`);
  }

  async updateOcrFields(scanId: string, corrections: Array<{ field_name: string; corrected_value: string }>): Promise<ScanDetail> {
    return this.request<ScanDetail>(`/scans/${scanId}/ocr-fields`, {
      method: 'PATCH',
      body: JSON.stringify({ corrections }),
    });
  }

  async listScans(riskBand?: string, skip = 0, limit = 50): Promise<ScanSummary[]> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (riskBand) params.append('risk_band', riskBand);
    return this.request<ScanSummary[]>(`/scans?${params.toString()}`);
  }

  async deleteScan(scanId: string): Promise<void> {
    return this.request<void>(`/scans/${scanId}`, { method: 'DELETE' });
  }

  // --- Medicines Directory ---
  async searchMedicines(query?: string, manufacturer?: string, dosageForm?: string): Promise<MedicineReferenceDetail[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (manufacturer) params.append('manufacturer', manufacturer);
    if (dosageForm) params.append('dosage_form', dosageForm);
    return this.request<MedicineReferenceDetail[]>(`/medicines/search?${params.toString()}`);
  }

  async getMedicine(id: string): Promise<MedicineReferenceDetail> {
    return this.request<MedicineReferenceDetail>(`/medicines/${id}`);
  }

  // --- Suspicious Product Reporting ---
  async createReport(reportData: {
    scan_id?: string;
    medicine_name: string;
    batch_number?: string;
    manufacturer?: string;
    purchase_location?: string;
    purchase_date?: string;
    concern_description: string;
  }): Promise<SuspiciousReport> {
    return this.request<SuspiciousReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getReports(): Promise<SuspiciousReport[]> {
    return this.request<SuspiciousReport[]>('/reports');
  }

  async getReport(id: string): Promise<SuspiciousReport> {
    return this.request<SuspiciousReport>(`/reports/${id}`);
  }

  // --- Dashboard ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/dashboard/summary');
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return this.request<DashboardAnalytics>('/dashboard/analytics');
  }

  // --- Admin ---
  async getAdminHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/admin/health');
  }

  async getAdminReports(statusFilter?: string): Promise<SuspiciousReport[]> {
    const params = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<SuspiciousReport[]>(`/admin/reports${params}`);
  }

  async updateReportStatus(reportId: string, status: string, admin_notes?: string): Promise<SuspiciousReport> {
    return this.request<SuspiciousReport>(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes }),
    });
  }

  async previewCsvImport(file: File): Promise<CsvPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<CsvPreviewResponse>('/admin/references/preview-csv', {
      method: 'POST',
      body: formData,
    });
  }

  async commitCsvImport(file: File, sourceCode = 'ADMIN_IMPORT'): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ message: string }>(`/admin/references/commit-csv?source_code=${sourceCode}`, {
      method: 'POST',
      body: formData,
    });
  }

  async getAuditLogs(limit = 50): Promise<any[]> {
    return this.request<any[]>(`/admin/audit-logs?limit=${limit}`);
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users');
  }
}

export const api = new ApiService();
