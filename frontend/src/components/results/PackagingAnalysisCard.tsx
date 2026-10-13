import React from 'react';
import { ScanImage } from '../../types';
import { Eye, Focus, Sun, Layers, AlertCircle } from 'lucide-react';

interface PackagingAnalysisCardProps {
  image?: ScanImage;
  visualSimilarityScore?: number | null;
  packagingNotes?: string | null;
}

export const PackagingAnalysisCard: React.FC<PackagingAnalysisCardProps> = ({
  image,
  visualSimilarityScore,
  packagingNotes,
}) => {
  const blurScore = image?.blur_score ?? 0;
  const isBlurry = image?.is_blurry ?? false;
  const exposure = image?.exposure_score ?? 128;

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-surface-100">
        <div className="p-2 rounded-xl bg-surface-50 border border-surface-200 text-brand-600">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-navy-950 font-sans">Computer Vision & Packaging Inspection</h3>
          <p className="text-xs text-surface-400">OpenCV Image Quality & Structural Keypoint Metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Blur metric */}
        <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/70">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-surface-500 font-semibold flex items-center gap-1">
              <Focus className="w-3 h-3 text-brand-500" /> Sharpness (Laplacian)
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isBlurry ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {isBlurry ? 'Blurry' : 'Sharp'}
            </span>
          </div>
          <span className="text-base font-bold font-mono text-navy-950">{blurScore.toFixed(1)}</span>
          <span className="text-[10px] text-surface-400 block mt-0.5">Threshold: &gt; 80.0</span>
        </div>

        {/* Exposure metric */}
        <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/70">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-surface-500 font-semibold flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-500" /> Exposure Luminance
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-surface-200 text-surface-700">
              {exposure > 200 ? 'Bright' : exposure < 50 ? 'Dark' : 'Optimal'}
            </span>
          </div>
          <span className="text-base font-bold font-mono text-navy-950">{exposure.toFixed(1)}</span>
          <span className="text-[10px] text-surface-400 block mt-0.5">Scale: 0 (black) - 255 (white)</span>
        </div>

        {/* Visual packaging similarity */}
        <div className="p-3 bg-surface-50 rounded-xl border border-surface-200/70">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-surface-500 font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3 text-brand-500" /> Visual Similarity
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-surface-200 text-surface-700">
              {visualSimilarityScore !== null && visualSimilarityScore !== undefined ? `${visualSimilarityScore.toFixed(0)}%` : 'N/A'}
            </span>
          </div>
          <span className="text-base font-bold font-mono text-navy-950">
            {visualSimilarityScore !== null && visualSimilarityScore !== undefined ? `${visualSimilarityScore.toFixed(1)}%` : 'No Image Ref'}
          </span>
          <span className="text-[10px] text-surface-400 block mt-0.5">HSV + ORB keypoint correlation</span>
        </div>
      </div>

      {/* Packaging comparison notes */}
      {packagingNotes && (
        <div className="p-3 bg-brand-50/50 border border-brand-200 rounded-xl text-xs text-brand-900 leading-relaxed">
          <p>{packagingNotes}</p>
        </div>
      )}

      <div className="flex items-start gap-2 text-[11px] text-surface-500 bg-surface-50 p-2.5 rounded-xl border border-surface-200/50">
        <AlertCircle className="w-4 h-4 text-surface-400 shrink-0 mt-0.5" />
        <p>
          Packaging printing techniques naturally vary across factory lots, market redesigns, and regional distribution batches. Visual variation alone does not constitute counterfeit evidence.
        </p>
      </div>
    </div>
  );
};
