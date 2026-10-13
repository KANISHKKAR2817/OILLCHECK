import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { SuspiciousReport } from '../types';
import { 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  FileText, 
  Clock, 
  ShieldAlert, 
  HelpCircle,
  Building2,
  Calendar,
  MapPin
} from 'lucide-react';

export const ReportSuspiciousPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialScanId = searchParams.get('scan_id') || '';
  const initialName = searchParams.get('name') || '';

  const [medicineName, setMedicineName] = useState(initialName);
  const [scanId, setScanId] = useState(initialScanId);
  const [batchNumber, setBatchNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [concernDescription, setConcernDescription] = useState('');

  const [reports, setReports] = useState<SuspiciousReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const newReport = await api.createReport({
        scan_id: scanId.trim() || undefined,
        medicine_name: medicineName.trim(),
        batch_number: batchNumber.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        purchase_location: purchaseLocation.trim() || undefined,
        purchase_date: purchaseDate || undefined,
        concern_description: concernDescription.trim(),
      });

      setSuccessMsg(`Incident Report ${newReport.report_number} submitted successfully for administrative review.`);
      setConcernDescription('');
      setBatchNumber('');
      setPurchaseLocation('');
      fetchReports();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200">
            Submitted
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
            Under Clinical Review
          </span>
        );
      case 'referred_to_authority':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-purple-50 text-purple-800 border border-purple-200">
            Referred to Authority
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-surface-100 text-surface-600 border border-surface-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-surface-100 text-surface-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-sans tracking-tight">
            Suspicious Medicine Incident Reporting
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-surface-500 mt-1">
          Lodge packaging anomalies, counterfeit suspicions, or defective pharmaceutical batches for pharmacovigilance review
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-sans">File Incident Report</h3>
            <p className="text-xs text-surface-400">
              Provide as much packaging context as possible for clinical examiners
            </p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-900 font-sans">
                  Medicine / Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Augmentin 625mg or Lipitor"
                  className="w-full px-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-900 font-sans">
                  Related Scan ID <span className="text-surface-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={scanId}
                  onChange={(e) => setScanId(e.target.value)}
                  placeholder="e.g. b8912fa0-..."
                  className="w-full px-3.5 py-2.5 text-xs border border-surface-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-900 font-sans">
                  Batch / Lot Number
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. PF9842"
                  className="w-full px-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-900 font-sans">
                  Manufacturer Printed on Box
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Pfizer, GSK, Cipla"
                  className="w-full px-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-900 font-sans">
                  Purchase Location / Dispensing Source
                </label>
                <input
                  type="text"
                  value={purchaseLocation}
                  onChange={(e) => setPurchaseLocation(e.target.value)}
                  placeholder="e.g. City Care Pharmacy, 5th Ave or Online Retailer"
                  className="w-full px-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-900 font-sans">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-navy-900 font-sans">
                Description of Concern & Packaging Flaws <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={concernDescription}
                onChange={(e) => setConcernDescription(e.target.value)}
                placeholder="Describe why this product seems suspicious: e.g. packaging foil peeling, misspelled active ingredient, no hologram, discoloration of tablets, unexpected bitter odor, or suspicious seller..."
                className="w-full px-3.5 py-2.5 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>

            {/* Disclaimer notice */}
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 text-[11px] text-surface-500 leading-relaxed">
              <strong>Reporting Notice:</strong> Submitting a report records the incident in PillCheck's audit log and reviewer queue. It does not automatically file criminal charges or notify national regulators unless an active regulatory dispatch webhook is configured.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Report...' : 'Submit Incident Report'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Submitted Reports History */}
        <div className="space-y-4">
          <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-950 font-sans flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              Your Filed Incident Reports ({reports.length})
            </h3>

            {isLoading ? (
              <p className="text-xs font-mono text-surface-400 text-center py-6">Loading reports...</p>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 px-2 text-xs text-surface-400">
                You have not filed any suspicious medicine reports.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-navy-950 text-[11px]">
                        {rep.report_number}
                      </span>
                      {getStatusBadge(rep.status)}
                    </div>

                    <div>
                      <span className="font-bold text-navy-900 block">{rep.medicine_name}</span>
                      {rep.batch_number && (
                        <span className="text-[11px] text-surface-500 font-mono">
                          Batch: {rep.batch_number}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-surface-600 line-clamp-2 italic">
                      "{rep.concern_description}"
                    </p>

                    {rep.admin_notes && (
                      <div className="p-2 bg-brand-50 border border-brand-200 rounded-lg text-[11px] text-brand-900">
                        <strong>Review Note: </strong>
                        {rep.admin_notes}
                      </div>
                    )}

                    <div className="text-[10px] text-surface-400 font-mono pt-1 border-t border-surface-200/60">
                      Filed: {new Date(rep.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
