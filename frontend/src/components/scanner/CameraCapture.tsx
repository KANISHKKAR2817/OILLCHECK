import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Check, SwitchCamera } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = async (mode: 'environment' | 'user') => {
    setErrorMsg(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission was denied. Please allow camera access in your browser settings to scan packaging live.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No optical camera device was detected on your hardware.');
      } else {
        setErrorMsg(`Camera initialization error: ${err.message || 'Unknown device error'}`);
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCapturedBlob(blob);
          }
        },
        'image/jpeg',
        0.95
      );
    }
  };

  const retakePhoto = () => {
    setCapturedBlob(null);
  };

  const confirmPhoto = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `camera_scan_${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onCapture(file);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="bg-navy-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {errorMsg ? (
        <div className="text-center py-12 px-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-white">Camera Access Notice</h4>
          <p className="text-xs text-surface-300 max-w-md mx-auto leading-relaxed">{errorMsg}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => startCamera(facingMode)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
            >
              Retry Camera
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-surface-300 text-xs font-semibold rounded-xl"
            >
              Use File Upload Instead
            </button>
          </div>
        </div>
      ) : capturedBlob ? (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black max-h-96 flex items-center justify-center">
            <img
              src={URL.createObjectURL(capturedBlob)}
              alt="Captured packaging"
              className="object-contain max-h-96 w-full"
            />
            <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-xs font-mono">
              Review Captured Frame
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={retakePhoto}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Photograph
            </button>
            <button
              onClick={confirmPhoto}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              Use This Image for Screening
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black max-h-96 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="object-contain max-h-96 w-full"
            />
            {/* Viewfinder crosshairs overlay */}
            <div className="absolute inset-8 sm:inset-12 border-2 border-brand-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between text-[10px] font-mono text-brand-300 uppercase tracking-wider">
                <span>[ Align Medicine Packaging ]</span>
                <span>Focus Target</span>
              </div>
              <div className="text-center text-[10px] text-surface-400 font-mono">
                Keep batch stamp & expiration date within bounds
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={toggleCameraFacing}
              className="flex items-center gap-2 px-3 py-2 bg-navy-800 hover:bg-navy-700 text-surface-300 text-xs rounded-xl"
              title="Switch camera"
            >
              <SwitchCamera className="w-4 h-4" />
              <span className="hidden sm:inline">Flip Camera</span>
            </button>

            <button
              onClick={capturePhoto}
              className="flex items-center gap-2 px-8 py-3 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Capture Packaging</span>
            </button>

            <button
              onClick={onCancel}
              className="text-xs text-surface-400 hover:text-white px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
