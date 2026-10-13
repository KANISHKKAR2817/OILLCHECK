import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ScanLine, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Database, 
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Decision-Support Platform for Public Health & Pharmacovigilance</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight font-sans max-w-4xl mx-auto leading-tight">
          Scan Smart. Verify Better. <span className="text-brand-600">Stay Safe.</span>
        </h1>

        <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed">
          PillCheck provides evidence-based medicine screening. Capture packaging photographs, extract visible text with OCR, cross-reference public formularies, and inspect observable security indicators.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/scanner"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all text-sm"
          >
            <ScanLine className="w-4 h-4" />
            <span>Launch Medicine Scanner</span>
          </Link>

          <Link
            to="/medicines"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-surface-50 text-navy-900 border border-surface-200 font-semibold rounded-2xl shadow-2xs transition-colors text-sm"
          >
            <Search className="w-4 h-4 text-surface-400" />
            <span>Explore Reference Formularies</span>
          </Link>
        </div>

        {/* Core Ethics Disclaimer */}
        <div className="max-w-3xl mx-auto mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-950">Essential Safety Principle:</strong> PillCheck is a preliminary decision-support tool. It does not certify that a medicine is authentic or counterfeit. Absolute pharmaceutical verification requires laboratory analytical chemistry or official manufacturer supply-chain inspection.
          </p>
        </div>
      </section>

      {/* The Threat: Problem Statement */}
      <section className="bg-white border-y border-surface-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-600 font-bold">The Challenge</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-1">
              Counterfeit & Substandard Medicines Threaten Healthcare
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-2">
              Convincing packaging replicas make distinguishing suspicious products challenging for consumers and clinical staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">01</div>
              <h3 className="text-base font-bold text-navy-950">Visual Mimicry</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Illicit manufacturing operations replicate pharmaceutical cartons, blister foils, and logo graphics to deceive patients and pharmacies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">02</div>
              <h3 className="text-base font-bold text-navy-950">Disconnected Registries</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Formulary databases and recall alerts are fragmented across government websites, leaving consumers without immediate verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">03</div>
              <h3 className="text-base font-bold text-navy-950">Delayed Pharmacovigilance</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Reporting suspicious products typically involves lengthy paperwork, delaying the identification of contaminated batches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Architecture Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-brand-600 font-bold">The Solution</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-1">
            Real Multi-Stage Screening Workflow
          </h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-2">
            Every step is genuinely computed and traceable to evidence-backed decision rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-navy-950">1. Capture & Quality</h4>
            <p className="text-xs text-surface-500 leading-relaxed">
              Upload or snap packaging photos. OpenCV verifies Laplacian sharpness and illumination to prevent unreadable scans.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-navy-950">2. Real OCR Parsing</h4>
            <p className="text-xs text-surface-500 leading-relaxed">
              Tesseract OCR extracts medicine name, dosage, manufacturer, batch number, and expiration date into structured fields.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-navy-950">3. Formulary Validation</h4>
            <p className="text-xs text-surface-500 leading-relaxed">
              Cross-checks extracted entities against official FDA NDC, WHO Essential Medicines, and CDSCO regulatory records.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-navy-950">4. Explainable Scoring</h4>
            <p className="text-xs text-surface-500 leading-relaxed">
              Transparent rule evaluation assigns risk status bands (Low Risk, Needs Verification, Elevated Concern) with actionable advice.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Data Sources Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Cryptographic Provenance</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-sans">
              Authoritative Reference Databases
            </h3>
            <p className="text-xs sm:text-sm text-surface-300 leading-relaxed">
              PillCheck never fabricates catalogue records. Reference entries derive from verified regulatory authorities with documented timestamps, source URLs, and version control.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/medicines"
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs text-center shadow-lg transition-all"
            >
              Search Formulary Registry
            </Link>
            <Link
              to="/methodology"
              className="px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-surface-200 font-semibold text-xs text-center transition-colors"
            >
              Read Architecture Spec
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
