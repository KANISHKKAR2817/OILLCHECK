import React from 'react';
import { Camera, Sun, Focus, QrCode, Calendar, Tag } from 'lucide-react';

export const ScanInstructions: React.FC = () => {
  return (
    <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-navy-950 flex items-center gap-2 mb-3">
        <Camera className="w-4 h-4 text-brand-600" />
        Packaging Capture Best Practices
      </h3>
      <p className="text-xs text-surface-600 mb-4 leading-relaxed">
        For optimal OCR character recognition and packaging security evaluation, ensure the following critical packaging identifiers are clearly visible:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-surface-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy-900 mb-1">
            <Tag className="w-3.5 h-3.5 text-brand-500" />
            <span>Product Title</span>
          </div>
          <p className="text-[11px] text-surface-500 leading-snug">
            Brand name, generic active ingredient, and strength (e.g. 500 mg, 20 mg).
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-surface-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy-900 mb-1">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span>Batch & Expiry</span>
          </div>
          <p className="text-[11px] text-surface-500 leading-snug">
            Embossed crimp on blister foil or printed side flap of carton (B.No., EXP).
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-surface-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy-900 mb-1">
            <QrCode className="w-3.5 h-3.5 text-brand-500" />
            <span>Barcode / Matrix</span>
          </div>
          <p className="text-[11px] text-surface-500 leading-snug">
            GS1 2D DataMatrix or standard UPC/EAN barcode for product identification.
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-surface-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy-900 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Lighting & Focus</span>
          </div>
          <p className="text-[11px] text-surface-500 leading-snug">
            Avoid strong flash reflection on shiny blister foils; use indirect daylight.
          </p>
        </div>
      </div>
    </div>
  );
};
