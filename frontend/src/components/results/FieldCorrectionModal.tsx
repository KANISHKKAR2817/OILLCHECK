import React, { useState } from 'react';
import { OcrField } from '../../types';
import { X, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface FieldCorrectionModalProps {
  fields: OcrField[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitCorrections: (corrections: Array<{ field_name: string; corrected_value: string }>) => Promise<void>;
}

export const FieldCorrectionModal: React.FC<FieldCorrectionModalProps> = ({
  fields,
  isOpen,
  onClose,
  onSubmitCorrections,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.field_name] = f.effective_value || '';
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const editableFields = [
    { name: 'medicine_name', label: 'Medicine / Brand Name', placeholder: 'e.g. Lipitor, Augmentin, Dolo 650' },
    { name: 'manufacturer', label: 'Manufacturer Name', placeholder: 'e.g. Pfizer, GSK, Cipla, Sun Pharma' },
    { name: 'batch_number', label: 'Batch / Lot Number', placeholder: 'e.g. PF9842, GSK4012' },
    { name: 'expiry_date', label: 'Expiration Date', placeholder: 'e.g. 01/2027, MAY 2026' },
    { name: 'dosage', label: 'Strength / Dosage', placeholder: 'e.g. 20 mg, 500 mg, 625 mg' },
    { name: 'dosage_form', label: 'Dosage Form', placeholder: 'e.g. Tablet, Capsule, Syrup' },
  ];

  const handleInputChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const correctionsPayload = Object.entries(formValues).map(([k, v]) => ({
        field_name: k,
        corrected_value: v.trim(),
      }));
      await onSubmitCorrections(correctionsPayload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit field corrections');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-surface-200">
        <div className="p-5 border-b border-surface-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-sans">
              Review & Correct Packaging Metadata
            </h3>
            <p className="text-xs text-surface-400">
              Verified corrections update reference checks without losing raw OCR data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-navy-900 rounded-lg hover:bg-surface-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            {editableFields.map((field) => {
              const currentOcr = fields.find((f) => f.field_name === field.name);
              const originalVal = currentOcr?.extracted_value;

              return (
                <div key={field.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-navy-900 font-sans">
                      {field.label}
                    </label>
                    {originalVal && (
                      <span className="text-[10px] text-surface-400 font-mono">
                        OCR raw: {originalVal}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formValues[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-xs border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-surface-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Re-evaluating Risk...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply Corrections & Re-verify
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
