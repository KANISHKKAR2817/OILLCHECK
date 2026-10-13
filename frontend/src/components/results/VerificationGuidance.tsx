import React from 'react';
import { RiskBand } from '../../types';
import { CheckCircle2, PhoneCall, ShieldAlert, FileText, UserCheck } from 'lucide-react';

interface VerificationGuidanceProps {
  riskBand: RiskBand;
  onReportSuspicious: () => void;
}

export const VerificationGuidance: React.FC<VerificationGuidanceProps> = ({
  riskBand,
  onReportSuspicious,
}) => {
  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-surface-100">
        <div className="p-2 rounded-xl bg-surface-50 border border-surface-200 text-brand-600">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-navy-950 font-sans">Recommended Verification Next Steps</h3>
          <p className="text-xs text-surface-400">Actionable decision support based on screening findings</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {riskBand === 'ELEVATED_CONCERN' ? (
          <>
            <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-950 font-semibold block">1. Withhold Medication Dispensation / Consumption</strong>
                <p className="text-red-800 text-[11px] mt-0.5 leading-relaxed">
                  Due to material discrepancies or conflicting regulatory identifiers, do not consume this medicine until verified by a licensed pharmacist.
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface-50 border border-surface-200/80 rounded-xl flex items-start gap-3">
              <PhoneCall className="w-4 h-4 text-navy-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy-900 font-semibold block">2. Contact Manufacturer Customer Helpline</strong>
                <p className="text-surface-600 text-[11px] mt-0.5 leading-relaxed">
                  Provide the printed Batch Number and Expiry Date directly to the manufacturer's quality assurance hotline for lot authentication.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
              <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="text-amber-950 font-semibold block">3. Lodge Suspicious Product Incident Report</strong>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  Submit a formal incident report through PillCheck to document this batch for regulatory review.
                </p>
                <button
                  onClick={onReportSuspicious}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  File Incident Report Now
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-surface-50 border border-surface-200/80 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy-900 font-semibold block">1. Physical Packaging Integrity Inspection</strong>
                <p className="text-surface-600 text-[11px] mt-0.5 leading-relaxed">
                  Inspect tamper-evident holographic stickers, ensure blister foil has no punctures or micro-tears, and confirm tablets are uniformly colored.
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface-50 border border-surface-200/80 rounded-xl flex items-start gap-3">
              <UserCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy-900 font-semibold block">2. Verify Dispensing Pharmacy Channel</strong>
                <p className="text-surface-600 text-[11px] mt-0.5 leading-relaxed">
                  Ensure the medicine was acquired from a licensed retail or hospital pharmacy that issues official tax invoices with traceable batch numbers.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
