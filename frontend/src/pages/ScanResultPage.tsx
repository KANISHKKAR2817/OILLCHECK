import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ScanDetail } from '../types';
import { RiskBanner } from '../components/results/RiskBanner';
import { ExtractedFieldsTable } from '../components/results/ExtractedFieldsTable';
import { ReferenceMatchCard } from '../components/results/ReferenceMatchCard';
import { PackagingAnalysisCard } from '../components/results/PackagingAnalysisCard';
import { FieldCorrectionModal } from '../components/results/FieldCorrectionModal';
import { VerificationGuidance } from '../components/results/VerificationGuidance';
import { PrintableReport } from '../components/results/PrintableReport';
import { 
  ScanLine, 
  History, 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ShieldAlert,
  Edit3
} from 'lucide-react';

export const ScanResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);

  const fetchScan = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getScan(id);
      setScan(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve scan results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, [id]);

  const handleApplyCorrections = async (corrections: Array<{ field_name: string; corrected_value: string }>) => {
    if (!id) return;
    const updated = await api.updateOcrFields(id, corrections);
    setScan(updated);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-surface-500">Loading screening evaluation data...</p>
      </div>
    );
  }

  if (errorMsg || !scan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-navy-950">Scan Result Not Available</h2>
        <p className="text-xs text-surface-500 max-w-md mx-auto">{errorMsg || 'The requested scan record does not exist or access is restricted.'}</p>
        <Link
          to="/scanner"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
        >
          <ScanLine className="w-4 h-4" />
          <span>Perform New Scan</span>
        </Link>
      </div>
    );
  }

  const primaryImage = scan.images[activeImageIdx] || scan.images[0];
  const medicineNameField = scan.ocr_result?.fields.find((f) => f.field_name === 'medicine_name');
  const titleDisplay = medicineNameField?.effective_value || 'Pharmaceutical Packaging';
  const conflictIndicators = scan.analysis_result?.indicators
    .filter((i) => i.severity === 'critical')
    .map((i) => i.description) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Report Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/history" className="text-surface-400 hover:text-navy-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-sans tracking-tight">
              {titleDisplay}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-surface-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(scan.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>Scan ID: {scan.id.slice(0, 8)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <PrintableReport scan={scan} />
          <Link
            to="/scanner"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Next</span>
          </Link>
        </div>
      </div>

      {/* Risk Band Banner */}
      <RiskBanner
        riskBand={scan.overall_risk_band}
        riskScore={scan.risk_score}
        summary={scan.summary}
      />

      {/* Main Grid: Images & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Uploaded Packaging Images */}
        <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 font-mono">
              Photographed Surface
            </h3>
            <span className="text-[10px] font-mono text-surface-400">
              {scan.images.length} Image{scan.images.length > 1 ? 's' : ''} Stored
            </span>
          </div>

          {primaryImage ? (
            <div className="rounded-xl overflow-hidden bg-navy-900 border border-surface-200 flex items-center justify-center max-h-80 group relative">
              <img
                src={primaryImage.url}
                alt="Captured packaging"
                className="object-contain max-h-80 w-full"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-mono uppercase">
                {primaryImage.image_role} surface
              </div>
            </div>
          ) : (
            <div className="h-64 bg-surface-50 rounded-xl flex items-center justify-center text-xs text-surface-400">
              No image file available
            </div>
          )}

          {/* Image surface selector if front and back exist */}
          {scan.images.length > 1 && (
            <div className="flex gap-2 pt-1">
              {scan.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold font-mono uppercase transition-colors ${
                    activeImageIdx === idx
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {img.image_role} view
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right 2 cols: Reference Match & Computer Vision */}
        <div className="lg:col-span-2 space-y-6">
          <ReferenceMatchCard
            matchType={scan.analysis_result?.reference_match_type || 'NO_REFERENCE_AVAILABLE'}
            matchedRef={scan.analysis_result?.matched_reference}
            conflicts={conflictIndicators}
          />

          <PackagingAnalysisCard
            image={primaryImage}
            visualSimilarityScore={scan.analysis_result?.visual_similarity_score}
            packagingNotes={scan.analysis_result?.packaging_notes}
          />
        </div>
      </div>

      {/* Extracted Fields Table with Review & Correct action */}
      {scan.ocr_result && (
        <ExtractedFieldsTable
          fields={scan.ocr_result.fields}
          onOpenCorrectionModal={() => setCorrectionModalOpen(true)}
        />
      )}

      {/* Evidence-Backed Risk Indicators List */}
      {scan.analysis_result && scan.analysis_result.indicators.length > 0 && (
        <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-100">
            <div>
              <h3 className="text-sm font-bold text-navy-950 font-sans">
                Evidence-Backed Risk Indicators ({scan.analysis_result.indicators.length})
              </h3>
              <p className="text-xs text-surface-400">
                Transparent rules engine factor breakdown
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {scan.analysis_result.indicators.map((ind) => (
              <div
                key={ind.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3.5 ${
                  ind.severity === 'critical'
                    ? 'bg-red-50/70 border-red-200'
                    : ind.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-surface-50 border-surface-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {ind.severity === 'critical' ? (
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                  ) : ind.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  )}
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-navy-950">{ind.title}</h4>
                    <span className="font-mono text-[10px] text-surface-400 uppercase">
                      Code: {ind.code}
                    </span>
                  </div>
                  <p className="text-surface-700 leading-relaxed">{ind.description}</p>
                  {ind.evidence && (
                    <p className="text-[11px] text-surface-500 font-mono pt-0.5">
                      <strong>Observed Evidence:</strong> {ind.evidence}
                    </p>
                  )}
                  {ind.mitigation_guidance && (
                    <p className="text-[11px] text-brand-800 font-medium pt-0.5">
                      <strong>Recommended Action:</strong> {ind.mitigation_guidance}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Verification Guidance & Suspicious reporting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VerificationGuidance
          riskBand={scan.overall_risk_band}
          onReportSuspicious={() => navigate(`/reports/new?scan_id=${scan.id}&name=${encodeURIComponent(titleDisplay)}`)}
        />

        {/* Quick Report Box */}
        <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-navy-950 font-sans flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Suspect Substandard or Counterfeit Packaging?
            </h3>
            <p className="text-xs text-surface-500 leading-relaxed">
              If physical packaging exhibits odd printing, suspicious batch stamps, or adverse physical reactions, file a formal incident report for regulatory follow-up.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate(`/reports/new?scan_id=${scan.id}&name=${encodeURIComponent(titleDisplay)}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Suspicious Product Associated with this Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Persistent Regulatory Safety Notice */}
      <div className="p-4 bg-surface-100 rounded-2xl border border-surface-200 text-xs text-surface-600 leading-relaxed">
        <strong className="text-navy-900">Persistent Safety Notice: </strong>
        {scan.disclaimer}
      </div>

      {/* Review & Correct Modal */}
      {scan.ocr_result && (
        <FieldCorrectionModal
          fields={scan.ocr_result.fields}
          isOpen={correctionModalOpen}
          onClose={() => setCorrectionModalOpen(false)}
          onSubmitCorrections={handleApplyCorrections}
        />
      )}
    </div>
  );
};
