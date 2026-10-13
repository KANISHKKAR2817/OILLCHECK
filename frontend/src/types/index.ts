export type UserRole = 'user' | 'pharmacist' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type RiskBand = 'LOW_OBSERVED_RISK' | 'NEEDS_VERIFICATION' | 'ELEVATED_CONCERN' | 'ANALYSIS_FAILED';

export interface OcrField {
  id: string;
  field_name: string;
  extracted_value: string | null;
  confidence: number;
  corrected_value: string | null;
  is_user_corrected: boolean;
  effective_value: string | null;
  validation_status: 'valid' | 'invalid_format' | 'uncertain' | 'missing' | 'confirmed';
  needs_review: boolean;
}

export interface OcrResult {
  id: string;
  raw_text: string;
  language: string;
  engine_used: string;
  avg_confidence: number;
  fields: OcrField[];
}

export interface RiskIndicator {
  id: string;
  code: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  evidence?: string | null;
  mitigation_guidance?: string | null;
}

export interface MatchedReference {
  id: string;
  product_id: string;
  brand_name: string;
  generic_name: string;
  active_ingredient: string;
  strength: string;
  dosage_form: string;
  manufacturer: string;
  country_of_origin?: string | null;
  packaging_desc?: string | null;
  regulatory_id?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  version: number;
}

export interface AnalysisResult {
  id: string;
  engine_version: string;
  reference_match_type: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'CONFLICTING_INFO' | 'NO_REFERENCE_AVAILABLE' | 'VERIFICATION_UNAVAILABLE';
  matched_reference_id?: string | null;
  matched_reference?: MatchedReference | null;
  visual_similarity_score?: number | null;
  packaging_notes?: string | null;
  indicators: RiskIndicator[];
}

export interface ScanImage {
  id: string;
  image_role: 'front' | 'back' | 'detail';
  file_size: number;
  mime_type: string;
  width?: number | null;
  height?: number | null;
  blur_score?: number | null;
  is_blurry: boolean;
  exposure_score?: number | null;
  url: string;
}

export interface ScanDetail {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scan_mode: 'upload' | 'camera';
  overall_risk_band: RiskBand;
  risk_score: number;
  summary?: string | null;
  created_at: string;
  updated_at: string;
  disclaimer: string;
  images: ScanImage[];
  ocr_result?: OcrResult | null;
  analysis_result?: AnalysisResult | null;
}

export interface ScanSummary {
  id: string;
  user_id: string;
  status: string;
  scan_mode: string;
  overall_risk_band: RiskBand;
  risk_score: number;
  medicine_name?: string | null;
  created_at: string;
}

export interface MedicineBatch {
  id: string;
  batch_number: string;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  status: string;
}

export interface ReferenceSource {
  id: string;
  name: string;
  code: string;
  source_type: string;
  url?: string | null;
  is_active: boolean;
}

export interface MedicineReferenceDetail {
  id: string;
  product_id: string;
  brand_name: string;
  generic_name: string;
  active_ingredient: string;
  strength: string;
  dosage_form: string;
  manufacturer: string;
  country_of_origin?: string | null;
  packaging_desc?: string | null;
  barcode?: string | null;
  regulatory_id?: string | null;
  source_id?: string | null;
  source?: ReferenceSource | null;
  version: number;
  is_active: boolean;
  created_at: string;
  batches: MedicineBatch[];
}

export interface SuspiciousReport {
  id: string;
  report_number: string;
  user_id: string;
  scan_id?: string | null;
  medicine_name: string;
  batch_number?: string | null;
  manufacturer?: string | null;
  purchase_location?: string | null;
  purchase_date?: string | null;
  concern_description: string;
  status: 'submitted' | 'under_review' | 'more_info_required' | 'referred_to_authority' | 'closed';
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  total_scans: number;
  processing_failures: number;
  needs_verification_count: number;
  elevated_concern_count: number;
  low_risk_count: number;
  total_reports_submitted: number;
}

export interface ActivityPoint {
  date: string;
  scans: number;
  elevated_count: number;
}

export interface StatusCount {
  name: string;
  count: number;
}

export interface DashboardAnalytics {
  summary: DashboardSummary;
  risk_distribution: StatusCount[];
  activity_timeline: ActivityPoint[];
  recent_scans: Array<{
    id: string;
    overall_risk_band: RiskBand;
    risk_score: number;
    medicine_name: string;
    created_at: string;
  }>;
}

export interface SystemHealth {
  status: string;
  database_connected: boolean;
  ocr_engine_available: boolean;
  ocr_engine_name: string;
  cv_pipeline_ready: boolean;
  storage_writable: boolean;
  total_references: number;
  total_users: number;
  total_scans: number;
  total_reports: number;
  engine_version: string;
}

export interface CsvPreviewItem {
  product_id: string;
  brand_name: string;
  generic_name: string;
  active_ingredient: string;
  strength: string;
  dosage_form: string;
  manufacturer: string;
  barcode?: string | null;
  is_valid: boolean;
  validation_error?: string | null;
  is_duplicate: boolean;
}

export interface CsvPreviewResponse {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  preview_items: CsvPreviewItem[];
  source_name: string;
}
