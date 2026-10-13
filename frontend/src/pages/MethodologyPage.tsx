import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  AlertTriangle, 
  Eye, 
  FileCheck, 
  Lock, 
  ExternalLink 
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3 pb-6 border-b border-surface-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Scientific & Algorithmic Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-navy-950 font-sans tracking-tight">
          PillCheck Methodology & Technical Specification
        </h1>
        <p className="text-sm text-surface-500 max-w-2xl mx-auto leading-relaxed">
          Detailed documentation on computer vision pipelines, OCR entity recognition, risk scoring engines, and regulatory boundaries.
        </p>
      </div>

      {/* Critical Core Safety Section */}
      <section className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-6 sm:p-8 space-y-3 text-xs leading-relaxed text-amber-950">
        <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Fundamental Clinical Safety Notice</span>
        </div>
        <p>
          <strong>PillCheck does not certify that a medicine is genuine or counterfeit.</strong> It is an explainable decision-support and screening platform designed to assist patients, pharmacists, and health workers in identifying observable warning indicators.
        </p>
        <p>
          High-end counterfeit products may feature visually indistinguishable packaging while containing incorrect active pharmaceutical ingredients (API) or hazardous fillers. Final clinical verification requires laboratory analytical chromatography (HPLC/MS) or formal manufacturer supply-chain pedigree authentication.
        </p>
      </section>

      {/* Section 1: Computer Vision & Preprocessing */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 font-sans">
            1. Image Quality Assessment & OpenCV Pipeline
          </h2>
        </div>
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-2xs space-y-4 text-xs text-surface-600 leading-relaxed">
          <p>
            When packaging images are received, the backend executes an OpenCV image assessment pipeline before OCR:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-navy-900">Laplacian Variance Blur Measurement:</strong> Sharpness is computed via <code className="font-mono bg-surface-100 px-1 py-0.5 rounded text-navy-900">cv2.Laplacian(gray, cv2.CV_64F).var()</code>. Images with variance below 80.0 are flagged as degraded.
            </li>
            <li>
              <strong className="text-navy-900">Adaptive Bilateral Filtering:</strong> Applies edge-preserving noise reduction to smooth blister foil speckles without eroding printed alphanumeric text edges.
            </li>
            <li>
              <strong className="text-navy-900">CLAHE Contrast Enhancement:</strong> Contrast Limited Adaptive Histogram Equalization normalizes uneven indoor lighting.
            </li>
            <li>
              <strong className="text-navy-900">Otsu Binarization:</strong> Automatic thresholding binarizes foreground text against diverse colored packaging surfaces.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: OCR Entity Extraction */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 font-sans">
            2. Structured Pharmaceutical Entity Parsing
          </h2>
        </div>
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-2xs space-y-4 text-xs text-surface-600 leading-relaxed">
          <p>
            Raw text extracted via Tesseract OCR or computer vision contour regions undergoes deterministic token parsing:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
              <strong className="text-navy-900 block mb-1">Batch / Lot Extraction</strong>
              <code className="text-[10px] font-mono text-brand-700 block bg-white p-1 rounded border border-surface-200">
                {'(BATCH|B\\.?NO|LOT)[:\\s]*([A-Z0-9\\-\\/]{3,16})'}
              </code>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
              <strong className="text-navy-900 block mb-1">Expiration Date Extraction</strong>
              <code className="text-[10px] font-mono text-brand-700 block bg-white p-1 rounded border border-surface-200">
                {'(EXP|EXPIRY|BEST\\s*BEFORE)[:\\s]*([0-9\\/\\-\\.]+{4,10})'}
              </code>
            </div>
          </div>
          <p className="pt-2">
            Every field stores an associated extraction confidence score. In the event of OCR ambiguity, users can trigger the "Review & Correct" workflow, which re-evaluates risk without overwriting raw character data.
          </p>
        </div>
      </section>

      {/* Section 3: Reference Matching & Provenance */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 font-sans">
            3. Regulatory Reference Matching & Provenance
          </h2>
        </div>
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-2xs space-y-4 text-xs text-surface-600 leading-relaxed">
          <p>
            PillCheck cross-references parsed information against public regulatory drug directories:
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
              <div>
                <strong className="text-navy-900 block">U.S. FDA National Drug Code (NDC) Directory</strong>
                <span className="text-[11px] text-surface-500">Official registry of marketed pharmaceuticals in the United States</span>
              </div>
              <a href="https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold text-xs flex items-center gap-1">
                FDA Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
              <div>
                <strong className="text-navy-900 block">WHO Model Lists of Essential Medicines (EML)</strong>
                <span className="text-[11px] text-surface-500">World Health Organization global standard medicines formulary</span>
              </div>
              <a href="https://www.who.gov/groups/expert-committee-on-selection-and-use-of-essential-medicines" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold text-xs flex items-center gap-1">
                WHO Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
              <div>
                <strong className="text-navy-900 block">CDSCO National Drug Registry</strong>
                <span className="text-[11px] text-surface-500">Central Drugs Standard Control Organization approved list</span>
              </div>
              <a href="https://cdsco.gov.in" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold text-xs flex items-center gap-1">
                CDSCO Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Explainable Risk Rules */}
      <section className="space-y-4" id="rules">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <FileCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 font-sans">
            4. Explainable Risk Scoring Engine
          </h2>
        </div>
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-2xs space-y-4 text-xs text-surface-600 leading-relaxed">
          <p>
            Unlike opaque deep learning models, PillCheck evaluates transparent rules with documented evidence weights:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 font-mono text-[10px] uppercase text-surface-500 border-b border-surface-100">
                <tr>
                  <th className="py-2.5 px-3">Rule Identifier</th>
                  <th className="py-2.5 px-3">Indicator Condition</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Risk Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 font-mono text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-semibold text-navy-900">RULE_CONFLICTING_MFR</td>
                  <td className="py-2 px-3">Printed manufacturer contradicts regulatory registration</td>
                  <td className="py-2 px-3 text-red-600 font-bold">Critical</td>
                  <td className="py-2 px-3">+60 pts</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-navy-900">RULE_EXPIRED_DATE</td>
                  <td className="py-2 px-3">Printed expiry date has elapsed</td>
                  <td className="py-2 px-3 text-red-600 font-bold">Critical</td>
                  <td className="py-2 px-3">+35 pts</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-navy-900">RULE_BLURRY_IMAGE</td>
                  <td className="py-2 px-3">Laplacian sharpness variance &lt; 80.0</td>
                  <td className="py-2 px-3 text-amber-600 font-bold">Warning</td>
                  <td className="py-2 px-3">+25 pts</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-navy-900">RULE_NO_REFERENCE</td>
                  <td className="py-2 px-3">Product not found in local catalog</td>
                  <td className="py-2 px-3 text-surface-600 font-bold">Info</td>
                  <td className="py-2 px-3">+20 pts</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-navy-900">RULE_MISSING_BATCH</td>
                  <td className="py-2 px-3">Missing or unreadable Batch/Lot #</td>
                  <td className="py-2 px-3 text-amber-600 font-bold">Warning</td>
                  <td className="py-2 px-3">+15 pts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5: Image Privacy & Storage */}
      <section className="space-y-4" id="privacy">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 font-sans">
            5. Image Privacy & Data Handling
          </h2>
        </div>
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-2xs space-y-3 text-xs text-surface-600 leading-relaxed">
          <p>
            Medical photographs uploaded to PillCheck are protected according to stringent privacy standards:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Images are stored outside the public web root in an isolated directory.</li>
            <li>Files receive random cryptographic UUID filenames to defeat enumeration attacks.</li>
            <li>Image downloads require authenticated ownership or administrative privileges.</li>
            <li>Images are processed strictly on local infrastructure and are <strong>never</strong> transmitted to third-party public AI APIs.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
