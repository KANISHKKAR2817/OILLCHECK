import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-surface-300 border-t border-navy-850 mt-auto">
      {/* Critical Safety Notice Banner */}
      <div className="bg-navy-900 border-b border-navy-800 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-surface-200 leading-relaxed">
            <strong className="text-amber-300">Mandatory Safety Disclaimer:</strong> PillCheck is a digital decision-support and screening platform. An AI result cannot prove or confirm whether a medicine is genuine or counterfeit. Final authenticity confirmation requires official manufacturer or regulatory laboratory testing. Do not consume a medicine solely because it receives a low-risk screening result.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              <span className="font-bold text-lg font-sans">PillCheck</span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              AI-assisted packaging authenticity screening, OCR text extraction, and verifiable reference checks.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-surface-400 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Engine v2.1.0 • Formularies Live</span>
            </div>
          </div>

          {/* Core Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono mb-3">Verification</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/scanner" className="hover:text-white transition-colors">Medicine Packaging Scanner</Link></li>
              <li><Link to="/medicines" className="hover:text-white transition-colors">Reference Formulary Catalog</Link></li>
              <li><Link to="/history" className="hover:text-white transition-colors">Screening History Archive</Link></li>
              <li><Link to="/reports/new" className="hover:text-white transition-colors text-amber-300">Report Suspicious Batch</Link></li>
            </ul>
          </div>

          {/* Reference Provenance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono mb-3">Authoritative Sources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  U.S. FDA NDC Directory <ExternalLink className="w-3 h-3 text-surface-500" />
                </a>
              </li>
              <li>
                <a href="https://www.who.gov/groups/expert-committee-on-selection-and-use-of-essential-medicines" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  WHO Essential Medicines <ExternalLink className="w-3 h-3 text-surface-500" />
                </a>
              </li>
              <li>
                <a href="https://cdsco.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  CDSCO National Registry <ExternalLink className="w-3 h-3 text-surface-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Methodology & Policy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono mb-3">Documentation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/methodology" className="hover:text-white transition-colors">Computer Vision Methodology</Link></li>
              <li><Link to="/methodology#rules" className="hover:text-white transition-colors">Risk Scoring Engine Rules</Link></li>
              <li><Link to="/methodology#limitations" className="hover:text-white transition-colors">Model Limitations & Ethics</Link></li>
              <li><Link to="/methodology#privacy" className="hover:text-white transition-colors">Image Privacy & Data Retention</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-surface-400 gap-4">
          <p>© {new Date().getFullYear()} PillCheck Platform. Open Decision-Support Framework for Public Health.</p>
          <p className="font-mono text-[11px]">ISO/IEC 27001-Aligned Secure Image Architecture</p>
        </div>
      </div>
    </footer>
  );
};
