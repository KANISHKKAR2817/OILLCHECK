import React from 'react';
import { OcrField } from '../../types';
import { Edit3, CheckCircle, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';

interface ExtractedFieldsTableProps {
  fields: OcrField[];
  onOpenCorrectionModal: () => void;
}

export const ExtractedFieldsTable: React.FC<ExtractedFieldsTableProps> = ({
  fields,
  onOpenCorrectionModal,
}) => {
  const getStatusBadge = (field: OcrField) => {
    if (field.is_user_corrected) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
          <Edit3 className="w-3 h-3" /> User Confirmed
        </span>
      );
    }

    switch (field.validation_status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> Extracted
          </span>
        );
      case 'uncertain':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Uncertain
          </span>
        );
      case 'invalid_format':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" /> Invalid Format
          </span>
        );
      case 'missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-100 text-surface-500 border border-surface-200">
            <HelpCircle className="w-3 h-3" /> Not Detected
          </span>
        );
    }
  };

  const fieldLabels: Record<string, string> = {
    medicine_name: 'Product / Medicine Name',
    brand_name: 'Brand Name',
    active_ingredient: 'Active Ingredient',
    dosage: 'Strength / Potency',
    dosage_form: 'Dosage Form',
    manufacturer: 'Manufacturer',
    batch_number: 'Batch / Lot Number',
    mfg_date: 'Manufacturing Date',
    expiry_date: 'Expiration Date',
    regulatory_id: 'Licence / Regulatory ID',
    barcode: 'Barcode / 2D Matrix',
  };

  return (
    <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-navy-950 font-sans">
            OCR-Extracted Pharmaceutical Metadata
          </h3>
          <p className="text-xs text-surface-400">
            Machine reading from packaging text regions
          </p>
        </div>
        <button
          onClick={onOpenCorrectionModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold border border-brand-200 transition-colors shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Review & Correct
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-50 text-surface-500 uppercase font-mono text-[10px] border-b border-surface-100">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Packaging Property</th>
              <th className="py-2.5 px-4 font-semibold">Extracted Value</th>
              <th className="py-2.5 px-4 font-semibold">Confidence</th>
              <th className="py-2.5 px-4 font-semibold">Validation State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {fields.map((f) => {
              const label = fieldLabels[f.field_name] || f.field_name.replace('_', ' ');
              const val = f.effective_value;

              return (
                <tr key={f.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-navy-900">{label}</td>
                  <td className="py-3 px-4">
                    {val ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy-950">{val}</span>
                        {f.is_user_corrected && f.extracted_value && f.extracted_value !== val && (
                          <span className="text-[10px] text-surface-400 font-mono line-through">
                            (orig: {f.extracted_value})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-surface-400 italic">None detected on surface</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-surface-600">
                    {f.confidence > 0 ? `${f.confidence.toFixed(0)}%` : '—'}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(f)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
