import React from 'react';
import { Loader2, CheckCircle2, Search, Cpu, Database, ShieldAlert } from 'lucide-react';

interface ProcessingTimelineProps {
  currentStage: number; // 1 to 5
}

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({ currentStage }) => {
  const stages = [
    {
      id: 1,
      title: 'Image Validation & Preprocessing',
      desc: 'Magic bytes check, Laplacian blur measurement, contrast enhancement (CLAHE), noise reduction.',
      icon: Cpu,
    },
    {
      id: 2,
      title: 'Optical Character & Code Extraction',
      desc: 'Text region binarization, Tesseract OCR character recognition, 2D barcode/QR detection.',
      icon: Search,
    },
    {
      id: 3,
      title: 'Structured Pharmaceutical Entity Parsing',
      desc: 'Regex & NER matching for medicine name, active ingredient, dosage form, batch, and expiry.',
      icon: CheckCircle2,
    },
    {
      id: 4,
      title: 'Formulary Reference & Batch Cross-Check',
      desc: 'Authoritative matching against FDA NDC, WHO Essential Medicines, and CDSCO registries.',
      icon: Database,
    },
    {
      id: 5,
      title: 'Explainable Decision-Support Synthesis',
      desc: 'Synthesizing evidence-backed risk indicators, visual packaging similarity, and verification recommendations.',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-base font-bold text-navy-950 font-sans">Executing Pipeline Analysis</h3>
          <p className="text-xs text-surface-500 font-mono">Backend Job Running • Synchronous Real Execution</p>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const isDone = stage.id < currentStage;
          const isCurrent = stage.id === currentStage;
          const isPending = stage.id > currentStage;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-brand-50/60 border-brand-300 ring-2 ring-brand-400/20 shadow-xs'
                  : isDone
                  ? 'bg-surface-50 border-surface-200'
                  : 'bg-white border-surface-100 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-brand-600 text-white'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-100 text-surface-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold ${isCurrent ? 'text-brand-900' : isDone ? 'text-navy-900' : 'text-surface-500'}`}>
                    {stage.title}
                  </h4>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    {isDone ? (
                      <span className="text-emerald-700">Completed</span>
                    ) : isCurrent ? (
                      <span className="text-brand-700">Active</span>
                    ) : (
                      <span className="text-surface-400">Queued</span>
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-surface-500 mt-0.5 leading-relaxed">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
