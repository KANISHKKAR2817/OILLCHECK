import React from 'react';
import { RiskBand } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface RiskBannerProps {
  riskBand: RiskBand;
  riskScore: number;
  summary?: string | null;
}

export const RiskBanner: React.FC<RiskBannerProps> = ({ riskBand, riskScore, summary }) => {
  const getBannerDetails = () => {
    switch (riskBand) {
      case 'LOW_OBSERVED_RISK':
        return {
          title: 'LOW OBSERVED RISK',
          color: 'text-emerald-800 bg-emerald-50 border-emerald-300 ring-emerald-500/10',
          badgeColor: 'bg-emerald-600 text-white',
          icon: ShieldCheck,
          defaultSummary:
            'No configured warning indicators were identified in the available packaging details. (Note: Screening does not prove absolute authenticity).',
        };
      case 'NEEDS_VERIFICATION':
        return {
          title: 'NEEDS VERIFICATION',
          color: 'text-amber-900 bg-amber-50/90 border-amber-300 ring-amber-500/10',
          badgeColor: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          defaultSummary:
            'Reference catalog is incomplete, image resolution is partial, or one or more key packaging fields require human confirmation.',
        };
      case 'ELEVATED_CONCERN':
        return {
          title: 'ELEVATED CONCERN',
          color: 'text-red-900 bg-red-50/90 border-red-300 ring-red-500/10',
          badgeColor: 'bg-red-600 text-white',
          icon: AlertOctagon,
          defaultSummary:
            'One or more material inconsistencies or suspicious packaging indicators require further formal verification.',
        };
      case 'ANALYSIS_FAILED':
      default:
        return {
          title: 'ANALYSIS INCONCLUSIVE',
          color: 'text-surface-800 bg-surface-100 border-surface-300 ring-surface-500/10',
          badgeColor: 'bg-surface-700 text-white',
          icon: HelpCircle,
          defaultSummary:
            'The packaging image could not be analysed reliably due to blur, severe reflection, or insufficient focus.',
        };
    }
  };

  const details = getBannerDetails();
  const Icon = details.icon;

  return (
    <div className={`p-6 rounded-2xl border ring-4 transition-all shadow-sm ${details.color}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white shadow-2xs">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${details.badgeColor}`}>
                Screening Status
              </span>
              <h2 className="text-xl font-extrabold tracking-tight font-sans">
                {details.title}
              </h2>
            </div>
            <p className="text-xs font-medium opacity-90 mt-1 max-w-2xl leading-relaxed">
              {summary || details.defaultSummary}
            </p>
          </div>
        </div>

        {/* Screening Indicator Score */}
        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-black/5 text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-2xl font-black font-mono tracking-tight">{riskScore.toFixed(0)}</span>
            <span className="text-xs font-mono text-surface-500">/ 100</span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-surface-500 font-semibold">
            Screening Indicator Score
          </p>
        </div>
      </div>

      <div className="pt-3 text-[11px] opacity-80 flex items-center justify-between flex-wrap gap-2">
        <span>
          * Note: Indicator score reflects observable warnings. It is an explainable decision-support metric and <strong>not</strong> a mathematical counterfeit probability.
        </span>
        <span className="font-mono">Engine v2.1.0</span>
      </div>
    </div>
  );
};
