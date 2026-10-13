import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  primaryFile: File | null;
  secondaryFile: File | null;
  onPrimaryChange: (file: File | null) => void;
  onSecondaryChange: (file: File | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  primaryFile,
  secondaryFile,
  onPrimaryChange,
  onSecondaryChange,
}) => {
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateAndSetFile = (file: File, isSecondary: boolean) => {
    setErrorMsg(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload JPEG, PNG, or WebP images.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File exceeds 15MB limit. Please upload a compressed photograph.');
      return;
    }

    if (isSecondary) {
      onSecondaryChange(file);
    } else {
      onPrimaryChange(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0], false);
      if (e.dataTransfer.files[1]) {
        validateAndSetFile(e.dataTransfer.files[1], true);
      }
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary Image Upload Zone */}
      <div>
        <label className="block text-xs font-semibold text-navy-950 uppercase tracking-wider mb-1.5 font-mono">
          Primary Packaging Image (Front / Label) <span className="text-red-500">*</span>
        </label>
        
        {primaryFile ? (
          <div className="relative rounded-2xl overflow-hidden border border-surface-200 bg-navy-900 group shadow-md max-h-72 flex items-center justify-center">
            <img
              src={URL.createObjectURL(primaryFile)}
              alt="Primary packaging preview"
              className="object-contain max-h-72 w-full"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono rounded-lg">
                {(primaryFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <button
                type="button"
                onClick={() => onPrimaryChange(null)}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => primaryInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
                : 'border-surface-300 hover:border-brand-400 hover:bg-surface-50'
            }`}
          >
            <input
              ref={primaryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  validateAndSetFile(e.target.files[0], false);
                }
              }}
            />
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-navy-900 mb-1">
              Click to select or drag & drop packaging image
            </p>
            <p className="text-xs text-surface-400">
              High resolution JPEG, PNG, or WebP up to 15MB
            </p>
          </div>
        )}
      </div>

      {/* Secondary Image Upload Zone (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1.5 font-mono">
          Secondary Image (Blister Foil / Reverse Side) <span className="text-surface-400 font-normal lowercase">(optional)</span>
        </label>
        
        {secondaryFile ? (
          <div className="relative rounded-2xl overflow-hidden border border-surface-200 bg-navy-900 group shadow-md max-h-56 flex items-center justify-center">
            <img
              src={URL.createObjectURL(secondaryFile)}
              alt="Secondary packaging preview"
              className="object-contain max-h-56 w-full"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono rounded-lg">
                {(secondaryFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <button
                type="button"
                onClick={() => onSecondaryChange(null)}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => secondaryInputRef.current?.click()}
            className="border border-dashed border-surface-300 hover:border-brand-400 hover:bg-surface-50 rounded-xl p-4 text-center cursor-pointer transition-colors"
          >
            <input
              ref={secondaryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  validateAndSetFile(e.target.files[0], true);
                }
              }}
            />
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-surface-600">
              <ImageIcon className="w-4 h-4 text-surface-400" />
              <span>Attach reverse side or batch imprint for cross-validation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
