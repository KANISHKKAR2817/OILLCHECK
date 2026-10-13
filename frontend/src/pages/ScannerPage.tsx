import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ImageUploader } from '../components/scanner/ImageUploader';
import { CameraCapture } from '../components/scanner/CameraCapture';
import { ScanInstructions } from '../components/scanner/ScanInstructions';
import { ProcessingTimeline } from '../components/scanner/ProcessingTimeline';
import { UploadCloud, Camera, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCameraCapture = (file: File) => {
    setPrimaryFile(file);
    setInputMode('upload'); // Switch back to preview
  };

  const handleStartAnalysis = async () => {
    if (!primaryFile) {
      setErrorMsg('Please upload or capture a packaging photograph before submitting.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setProcessingStage(1);

    // Update real processing stages
    const stageTimer1 = setTimeout(() => setProcessingStage(2), 500);
    const stageTimer2 = setTimeout(() => setProcessingStage(3), 1200);
    const stageTimer3 = setTimeout(() => setProcessingStage(4), 2000);

    try {
      const formData = new FormData();
      formData.append('image', primaryFile);
      if (secondaryFile) {
        formData.append('secondary_image', secondaryFile);
      }
      formData.append('scan_mode', inputMode);

      const result = await api.createScan(formData);
      setProcessingStage(5);

      setTimeout(() => {
        navigate(`/scans/${result.id}`);
      }, 700);
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setErrorMsg(err.message || 'Scan processing failed. Please ensure image contains clear packaging text.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-sans tracking-tight">
            Medicine Packaging Scanner
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-surface-500 mt-1">
          Capture high-fidelity photographs of pharmaceutical cartons, blister foils, or bottles for OCR verification
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block">Screening Analysis Interrupted</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Real Processing Overlay View */}
      {isProcessing ? (
        <ProcessingTimeline currentStage={processingStage} />
      ) : (
        <div className="space-y-6">
          {/* Capture Mode Toggle */}
          <div className="flex items-center justify-center p-1 bg-surface-100 rounded-2xl max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                inputMode === 'upload'
                  ? 'bg-white text-navy-950 shadow-xs'
                  : 'text-surface-600 hover:text-navy-950'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Image File</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                inputMode === 'camera'
                  ? 'bg-white text-navy-950 shadow-xs'
                  : 'text-surface-600 hover:text-navy-950'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Camera Capture</span>
            </button>
          </div>

          {/* Scanner Input Components */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            {inputMode === 'camera' ? (
              <CameraCapture
                onCapture={handleCameraCapture}
                onCancel={() => setInputMode('upload')}
              />
            ) : (
              <ImageUploader
                primaryFile={primaryFile}
                secondaryFile={secondaryFile}
                onPrimaryChange={setPrimaryFile}
                onSecondaryChange={setSecondaryFile}
              />
            )}
          </div>

          {/* Guidelines & Action */}
          <ScanInstructions />

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setPrimaryFile(null);
                setSecondaryFile(null);
              }}
              disabled={!primaryFile}
              className="px-4 py-2.5 text-xs font-semibold text-surface-500 hover:text-navy-900 disabled:opacity-30 transition-colors"
            >
              Clear Uploads
            </button>

            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={!primaryFile}
              className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              <span>Execute Verification Screening</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
