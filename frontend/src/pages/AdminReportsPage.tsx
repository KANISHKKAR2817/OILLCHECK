import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SuspiciousReport } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Send, 
  X, 
  Edit3,
  Filter,
  ShieldAlert
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<SuspiciousReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeReport, setActiveReport] = useState<SuspiciousReport | null>(null);

  const [newStatus, setNewStatus] = useState<string>('under_review');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminReports(statusFilter || undefined);
      setReports(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load report review queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleOpenReview = (report: SuspiciousReport) => {
    setActiveReport(report);
    setNewStatus(report.status);
    setAdminNotes(report.admin_notes || '');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;
    setIsUpdating(true);
    try {
      const updated = await api.updateReportStatus(activeReport.id, newStatus, adminNotes);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setActiveReport(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update report status');
    } finally {
      setIsUpdating(false);
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
            Under Review
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-sans tracking-tight">
              Incident Report Review Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Administrative triage, regulatory referral notes, and status lifecycle management
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">All Incident Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="more_info_required">More Info Required</option>
            <option value="referred_to_authority">Referred to Authority</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs font-mono text-center text-surface-400 py-12">Loading incident reports...</p>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-2xl p-12 text-center text-xs text-surface-400 shadow-2xs">
          No incident reports match the current filter criteria.
        </div>
      ) : (
        <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 text-surface-500 uppercase font-mono text-[10px] border-b border-surface-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Incident Ref</th>
                  <th className="py-3 px-4 font-semibold">Reported Medicine</th>
                  <th className="py-3 px-4 font-semibold">Batch Number</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date Filed</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">{r.report_number}</td>
                    <td className="py-3.5 px-4 font-medium text-navy-900">{r.medicine_name}</td>
                    <td className="py-3.5 px-4 font-mono text-surface-600">{r.batch_number || '—'}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-3.5 px-4 text-surface-500 font-mono text-[11px]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Triage & Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-surface-200">
            <div className="p-5 border-b border-surface-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-navy-950 font-sans">
                  Incident Review: {activeReport.report_number}
                </h3>
                <p className="text-xs text-surface-400">Medicine: {activeReport.medicine_name}</p>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="p-2 text-surface-400 hover:text-navy-900 rounded-lg hover:bg-surface-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 space-y-4">
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/80 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-surface-400 font-semibold block">User Concern Statement:</span>
                <p className="text-surface-700 italic">"{activeReport.concern_description}"</p>
                {activeReport.purchase_location && (
                  <p className="text-[11px] text-surface-500 pt-1">
                    <strong>Reported Seller / Location:</strong> {activeReport.purchase_location}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-900 font-sans">Update Incident Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="more_info_required">More Information Required</option>
                  <option value="referred_to_authority">Referred to Regulatory Authority</option>
                  <option value="closed">Closed / Resolved</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-navy-900 font-sans">Administrative Review Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record investigation findings, inspector contact, laboratory referral ticket number, or customer guidance..."
                  className="w-full px-3 py-2 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-4 border-t border-surface-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Triage Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
