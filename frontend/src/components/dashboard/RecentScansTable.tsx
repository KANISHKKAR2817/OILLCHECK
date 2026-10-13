import React from 'react';
import { Link } from 'react-router-dom';
import { RiskBand } from '../../types';
import { ArrowRight, ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface RecentScanItem {
  id: string;
  overall_risk_band: RiskBand;
  risk_score: number;
  medicine_name: string;
  created_at: string;
}

interface RecentScansTableProps {
  scans: RecentScanItem[];
}

export const RecentScansTable: React.FC<RecentScansTableProps> = ({ scans }) => {
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
    <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="p-4 sm:p-5 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-navy-950 font-sans">Recent Evaluations</h3>
          <p className="text-xs text-surface-400">Latest packaging scans analyzed by this account</p>
        </div>
        <Link
          to="/history"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <span>View All History</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {scans.length === 0 ? (
        <div className="text-center py-10 px-4">
          <p className="text-xs font-semibold text-surface-500">No Prior Scans Found</p>
          <p className="text-[11px] text-surface-400 mt-1 max-w-xs mx-auto">
            Upload or capture your first packaging photograph to begin authenticity screening.
          </p>
          <Link
            to="/scanner"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Start Medicine Scan
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50 text-surface-500 uppercase font-mono text-[10px] border-b border-surface-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Medicine Identifier</th>
                <th className="py-2.5 px-4 font-semibold">Screening Outcome</th>
                <th className="py-2.5 px-4 font-semibold">Score</th>
                <th className="py-2.5 px-4 font-semibold">Date Evaluated</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {scans.map((s) => (
                <tr key={s.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-navy-950">
                    {s.medicine_name || 'Packaging Scan'}
                  </td>
                  <td className="py-3 px-4">{getBadge(s.overall_risk_band)}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-navy-900">
                    {s.risk_score.toFixed(0)}/100
                  </td>
                  <td className="py-3 px-4 text-surface-500 font-mono text-[11px]">
                    {new Date(s.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/scans/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
                    >
                      <span>Open Result</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
