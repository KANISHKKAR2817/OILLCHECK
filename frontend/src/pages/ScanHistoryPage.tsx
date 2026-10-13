import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ScanSummary, RiskBand } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  HelpCircle, 
  Trash2, 
  ScanLine 
} from 'lucide-react';

export const ScanHistoryPage: React.FC = () => {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskBand, setSelectedRiskBand] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.listScans(selectedRiskBand || undefined);
      setScans(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retrieve scan history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedRiskBand]);

  const handleDelete = async (scanId: string) => {
    if (!window.confirm('Are you sure you want to remove this scan record? This action will be audited.')) {
      return;
    }
    try {
      await api.deleteScan(scanId);
      setScans((prev) => prev.filter((s) => s.id !== scanId));
    } catch (err: any) {
      alert(err.message || 'Could not delete scan record');
    }
  };

  const filteredScans = scans.filter((s) => {
    if (!searchTerm) return true;
    return (s.medicine_name || 'Packaging Scan').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getBadge = (band: RiskBand) => {
    switch (band) {
      case 'LOW_OBSERVED_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Low Risk
          </span>
        );
      case 'NEEDS_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Needs Verification
          </span>
        );
      case 'ELEVATED_CONCERN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-800 border border-red-200">
            <AlertOctagon className="w-3 h-3 text-red-600" /> Elevated Concern
          </span>
        );
      case 'ANALYSIS_FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-surface-100 text-surface-700 border border-surface-200">
            <HelpCircle className="w-3 h-3 text-surface-500" /> Inconclusive
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
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-sans tracking-tight">
              Screening Archive & History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Browse and reopen previous packaging authenticity screenings
          </p>
        </div>

        <Link
          to="/scanner"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <ScanLine className="w-4 h-4" />
          <span>New Medicine Scan</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-surface-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by extracted medicine or brand name..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-surface-400 shrink-0" />
          <select
            value={selectedRiskBand}
            onChange={(e) => setSelectedRiskBand(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">All Risk Bands</option>
            <option value="LOW_OBSERVED_RISK">Low Observed Risk</option>
            <option value="NEEDS_VERIFICATION">Needs Verification</option>
            <option value="ELEVATED_CONCERN">Elevated Concern</option>
            <option value="ANALYSIS_FAILED">Failed / Inconclusive</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-surface-400">
          Loading historical database records...
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {errorMsg}
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
          <p className="text-sm font-bold text-navy-950">No Matching Scans Located</p>
          <p className="text-xs text-surface-400 max-w-sm mx-auto">
            {searchTerm || selectedRiskBand
              ? 'Try adjusting your search query or risk classification filter.'
              : 'You have not performed any scans yet. Scanned medicine packagings will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 text-surface-500 uppercase font-mono text-[10px] border-b border-surface-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Identified Medicine</th>
                  <th className="py-3 px-4 font-semibold">Screening Band</th>
                  <th className="py-3 px-4 font-semibold">Indicator Score</th>
                  <th className="py-3 px-4 font-semibold">Capture Mode</th>
                  <th className="py-3 px-4 font-semibold">Evaluation Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredScans.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-navy-950">
                      {s.medicine_name || 'Packaging Scan'}
                    </td>
                    <td className="py-3.5 px-4">{getBadge(s.overall_risk_band)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      {s.risk_score.toFixed(0)}/100
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] capitalize text-surface-600">
                      {s.scan_mode}
                    </td>
                    <td className="py-3.5 px-4 text-surface-500 font-mono text-[11px]">
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/scans/${s.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg transition-colors"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1 text-surface-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete scan record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
