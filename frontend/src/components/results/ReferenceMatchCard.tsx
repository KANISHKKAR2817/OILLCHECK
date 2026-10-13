import React from 'react';
import { MatchedReference } from '../../types';
import { Database, CheckCircle2, AlertOctagon, HelpCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface ReferenceMatchCardProps {
  matchType: string;
  matchedRef?: MatchedReference | null;
  conflicts?: string[];
}

export const ReferenceMatchCard: React.FC<ReferenceMatchCardProps> = ({
  matchType,
  matchedRef,
  conflicts = [],
}) => {
  const getMatchHeader = () => {
    switch (matchType) {
      case 'EXACT_MATCH':
        return {
          title: 'Authoritative Reference Record Match',
          badge: 'Exact Formulary Match',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
        };
      case 'PARTIAL_MATCH':
        return {
          title: 'Plausible Reference Match',
          badge: 'Partial Formulary Match',
          badgeColor: 'bg-brand-100 text-brand-800 border-brand-300',
          icon: ShieldCheck,
          iconColor: 'text-brand-600',
        };
      case 'CONFLICTING_INFO':
        return {
          title: 'Conflicting Formulary Information',
          badge: 'Material Conflict Detected',
          badgeColor: 'bg-red-100 text-red-800 border-red-300',
          icon: AlertOctagon,
          iconColor: 'text-red-600',
        };
      case 'NO_REFERENCE_AVAILABLE':
      default:
        return {
          title: 'No Reference Record in Local Registry',
          badge: 'Uncatalogued Product',
          badgeColor: 'bg-surface-100 text-surface-700 border-surface-300',
          icon: HelpCircle,
          iconColor: 'text-surface-500',
        };
    }
  };

  const header = getMatchHeader();
  const Icon = header.icon;

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-surface-50 border border-surface-200">
            <Icon className={`w-5 h-5 ${header.iconColor}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-950 font-sans">{header.title}</h3>
            <p className="text-xs text-surface-400">Public Formulary Provenance & Integrity</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${header.badgeColor}`}>
          {header.badge}
        </span>
      </div>

      {/* Conflicting issues if any */}
      {conflicts.length > 0 && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1.5">
          <h4 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
            Detected Regulatory Conflicts:
          </h4>
          <ul className="list-disc list-inside text-xs text-red-800 space-y-1">
            {conflicts.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched Reference Details */}
      {matchedRef ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/70">
            <span className="text-[10px] font-mono uppercase text-surface-400 font-semibold block">Official Brand / Generic</span>
            <span className="font-bold text-navy-950 text-sm block mt-0.5">{matchedRef.brand_name}</span>
            <span className="text-surface-600 text-xs block">{matchedRef.generic_name}</span>
          </div>

          <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/70">
            <span className="text-[10px] font-mono uppercase text-surface-400 font-semibold block">Authorized Manufacturer</span>
            <span className="font-bold text-navy-950 text-sm block mt-0.5">{matchedRef.manufacturer}</span>
            <span className="text-surface-600 text-xs block">Country: {matchedRef.country_of_origin || 'Global'}</span>
          </div>

          <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/70">
            <span className="text-[10px] font-mono uppercase text-surface-400 font-semibold block">Strength & Dosage Form</span>
            <span className="font-semibold text-navy-900 block mt-0.5">{matchedRef.strength} • {matchedRef.dosage_form}</span>
            <span className="text-surface-500 text-[11px] block">Active: {matchedRef.active_ingredient}</span>
          </div>

          <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/70">
            <span className="text-[10px] font-mono uppercase text-surface-400 font-semibold block">Registry Provenance & Identifiers</span>
            <span className="font-mono text-navy-900 text-xs block mt-0.5">ID: {matchedRef.product_id}</span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-brand-600 font-medium">
              <Database className="w-3 h-3" />
              <span>{matchedRef.source_name || 'Public Drug Formulary'}</span>
              {matchedRef.source_url && (
                <a href={matchedRef.source_url} target="_blank" rel="noreferrer" className="ml-1 text-surface-400 hover:text-brand-700">
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-surface-50 rounded-xl border border-surface-200 text-xs text-surface-600 space-y-1.5 leading-relaxed">
          <p>
            No matching reference entry was found in PillCheck's configured public regulatory databases (FDA NDC, WHO EML, CDSCO).
          </p>
          <p className="text-[11px] text-surface-500 font-medium">
            <strong>Critical note:</strong> Absence of a medicine in this catalog does <em>not</em> indicate it is counterfeit. Local clinic or national market formularies may not yet be imported.
          </p>
        </div>
      )}
    </div>
  );
};
