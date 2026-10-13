import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { CsvPreviewResponse } from '../types';
import { 
  Database, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight,
  Download
} from 'lucide-react';

export const AdminReferencesPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResponse | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(null);
    setSuccessMsg(null);
    setErrorMsg(null);

    setIsPreviewing(true);
    try {
      const previewData = await api.previewCsvImport(file);
      setPreview(previewData);
    } catch (err: any) {
      setErrorMsg(err.message || 'CSV schema validation failed');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleCommit = async () => {
    if (!selectedFile) return;
    setIsCommitting(true);
    setErrorMsg(null);
    try {
      const res = await api.commitCsvImport(selectedFile);
      setSuccessMsg(res.message);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to commit CSV data');
    } finally {
      setIsCommitting(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'product_id,brand_name,generic_name,active_ingredient,strength,dosage_form,manufacturer,barcode\n' +
      'NDC-0069-4200-30,Lipitor,Atorvastatin Calcium,Atorvastatin,20 mg,Tablet,Pfizer,300694200305\n' +
      'NDC-0029-6085-12,Augmentin,Amoxicillin and Clavulanate,Amoxicillin,625 mg,Tablet,GlaxoSmithKline,300296085121\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pillcheck_reference_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950 font-sans tracking-tight">
              Reference Formulary Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 mt-1">
            Safe batch import, duplicate detection, and schema validation with strict data provenance
          </p>
        </div>

        <button
          onClick={downloadSampleCsv}
          className="flex items-center gap-2 px-4 py-2 border border-surface-300 rounded-xl text-xs font-semibold text-navy-900 hover:bg-surface-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-surface-500" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CSV Upload Dropzone */}
      <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-navy-950 font-sans">
            Batch Import Verified Reference Records (CSV)
          </h3>
          <p className="text-xs text-surface-400">
            Upload CSV with columns: product_id, brand_name, generic_name, active_ingredient, strength, dosage_form, manufacturer
          </p>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-surface-300 hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer hover:bg-surface-50/50 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-navy-950 mb-1">
            {selectedFile ? selectedFile.name : 'Select or drop CSV file for schema preview'}
          </p>
          <p className="text-xs text-surface-400">
            UTF-8 CSV format with verified national regulatory columns
          </p>
        </div>
      </div>

      {/* Preview Section */}
      {isPreviewing && (
        <p className="text-xs font-mono text-center text-surface-400 py-6">
          Validating CSV schema and duplicate records...
        </p>
      )}

      {preview && (
        <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold text-navy-950 font-sans">
                Pre-Import Verification Summary
              </h3>
              <p className="text-xs text-surface-400">
                Source: {preview.source_name}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-surface-100 text-surface-700">
                Total: {preview.total_rows}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Valid: {preview.valid_rows}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
                Duplicates/Errors: {preview.duplicate_rows + preview.invalid_rows}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 text-surface-500 uppercase font-mono text-[10px] border-b border-surface-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Product ID</th>
                  <th className="py-2.5 px-4 font-semibold">Brand Name</th>
                  <th className="py-2.5 px-4 font-semibold">Active Molecule</th>
                  <th className="py-2.5 px-4 font-semibold">Strength</th>
                  <th className="py-2.5 px-4 font-semibold">Manufacturer</th>
                  <th className="py-2.5 px-4 font-semibold">Validation State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {preview.preview_items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-50/50">
                    <td className="py-2.5 px-4 font-mono font-semibold text-navy-950">{item.product_id}</td>
                    <td className="py-2.5 px-4 font-medium">{item.brand_name}</td>
                    <td className="py-2.5 px-4 text-surface-600">{item.active_ingredient}</td>
                    <td className="py-2.5 px-4 text-surface-600">{item.strength}</td>
                    <td className="py-2.5 px-4 text-surface-600">{item.manufacturer}</td>
                    <td className="py-2.5 px-4">
                      {item.is_valid ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ready to Commit
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200" title={item.validation_error || ''}>
                          {item.validation_error || 'Duplicate / Invalid'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-surface-100 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleCommit}
              disabled={isCommitting || preview.valid_rows === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <span>{isCommitting ? 'Importing...' : `Commit ${preview.valid_rows} Verified Records`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
