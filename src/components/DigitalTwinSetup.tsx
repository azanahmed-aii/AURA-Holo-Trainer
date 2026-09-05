import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Dna, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Sparkles,
  Sliders,
  Maximize2
} from 'lucide-react';
import { AvatarConfig } from '../types';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { playSound, speakCue } from '../utils/audio';

interface DigitalTwinSetupProps {
  avatarConfig: AvatarConfig;
  onSaveAvatar: (newConfig: AvatarConfig) => void;
  onComplete: () => void;
}

export const DigitalTwinSetup: React.FC<DigitalTwinSetupProps> = ({
  avatarConfig,
  onSaveAvatar,
  onComplete,
}) => {
  const [scanStep, setScanStep] = useState<'idle' | 'scanning_front' | 'scanning_side' | 'synthesizing' | 'complete'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTheme, setActiveTheme] = useState<AvatarConfig['colorTheme']>(avatarConfig.colorTheme);
  const [renderStyle, setRenderStyle] = useState<AvatarConfig['renderStyle']>(avatarConfig.renderStyle);
  const [heightCm, setHeightCm] = useState(avatarConfig.heightCm);
  const [wingspanCm, setWingspanCm] = useState(avatarConfig.wingspanCm);
  const [avatarName, setAvatarName] = useState(avatarConfig.name);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Request camera access
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      playSound('click');
    } catch {
      setCameraError('Camera permission not granted or device not found. Using simulated biometric feed.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Scan Process
  const startScanFlow = () => {
    playSound('hologram_on');
    speakCue('Stand in center frame for biometric calibration.');
    setScanStep('scanning_front');
    setScanProgress(10);

    // Sequence of biometric calibration steps
    setTimeout(() => {
      playSound('scan');
      setScanProgress(35);
      setScanStep('scanning_side');
      speakCue('Capturing sagittal posture depth.');
    }, 2400);

    setTimeout(() => {
      playSound('scan');
      setScanProgress(70);
      setScanStep('synthesizing');
      speakCue('Synthesizing wireframe digital twin.');
    }, 5000);

    setTimeout(() => {
      playSound('success');
      setScanProgress(100);
      setScanStep('complete');
      speakCue('Biometric calibration complete. Digital twin ready.');
    }, 7800);
  };

  const handleFinish = () => {
    const updated: AvatarConfig = {
      ...avatarConfig,
      name: avatarName || 'AURA Twin 01',
      colorTheme: activeTheme,
      renderStyle: renderStyle,
      heightCm,
      wingspanCm,
      scanDate: new Date().toISOString(),
      syncLevel: 99.8,
    };
    onSaveAvatar(updated);
    playSound('click');
    onComplete();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 bg-white text-slate-900 editorial-grid min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
            CALIBRATION PROTOCOL
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 mt-1">
            BIOMETRICS.
          </h1>
          <p className="text-base text-slate-600 font-medium mt-2 max-w-2xl leading-relaxed">
            Synthesize and calibrate your 3D Digital Twin avatar with custom proportions, joint wireframes, and optical color spectrums.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 tracking-wider">
            STEP // 3D SCAN
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera Scanner View / Biometric Scanner */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${scanStep !== 'idle' ? 'bg-indigo-600 animate-ping' : 'bg-slate-300'}`} />
                <span className="font-black text-slate-900 uppercase tracking-wider">
                  {scanStep === 'idle' && 'READY FOR CALIBRATION'}
                  {scanStep === 'scanning_front' && 'STAGE 1: CORONAL SCAN [FRONT]'}
                  {scanStep === 'scanning_side' && 'STAGE 2: SAGITTAL DEPTH [SIDE]'}
                  {scanStep === 'synthesizing' && 'STAGE 3: POINT CLOUD RIGGING'}
                  {scanStep === 'complete' && 'DIGITAL TWIN SYNCHRONIZED'}
                </span>
              </div>
              <div className="font-mono-code font-black text-slate-500">
                {scanProgress}% PROGRESS
              </div>
            </div>

            {/* Video / Scan Viewport */}
            <div className="relative h-[340px] sm:h-[400px] w-full rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800">
              {/* Actual Video Element if Camera Active */}
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                /* Simulated Silhouette */
                <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                  <div className="relative z-10 w-48 h-72 border-2 border-dashed border-indigo-500/40 rounded-full flex flex-col items-center justify-center p-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-400/60 bg-indigo-950/30 mb-2 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                    </div>
                    <div className="w-28 h-32 border border-indigo-400/40 rounded-xl bg-indigo-950/20 flex items-center justify-center text-[10px] font-mono-code text-indigo-300 font-bold">
                      TORSO SENSOR
                    </div>
                    <div className="flex gap-4 mt-2">
                      <div className="w-6 h-16 border-b border-indigo-400/40" />
                      <div className="w-6 h-16 border-b border-indigo-400/40" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scanning Radar Laser Line */}
              {scanStep !== 'idle' && scanStep !== 'complete' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-1 bg-indigo-400 shadow-[0_0_15px_#6366f1] animate-scanline" />
                </div>
              )}

              {/* HUD Crosshairs */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-400 pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-400 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-400 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-400 pointer-events-none" />

              {/* Biometric Telemetry Overlay */}
              {scanStep !== 'idle' && (
                <div className="absolute top-4 left-6 space-y-1 font-mono-code text-[11px] text-white bg-black/80 p-3 rounded-xl border border-slate-700 backdrop-blur-md">
                  <div>LATENCY: 12ms</div>
                  <div>DEPTH CONFIDENCE: 98.6%</div>
                  <div>SKELETAL NODES: 33/33</div>
                  <div className="text-indigo-400 font-bold">STATUS: RE-MESHING</div>
                </div>
              )}

              {/* Success Badge */}
              {scanStep === 'complete' && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    Scan Synthesis Complete!
                  </h3>
                  <p className="text-sm text-slate-300 max-w-sm mt-1 font-medium">
                    Your 3D Digital Twin is rigged with 14 kinematic joints and ready for WebXR training.
                  </p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* Camera & Scanner Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={cameraActive ? stopCamera : startCamera}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${
                    cameraActive 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                      : 'bg-white border-slate-300 text-slate-700 hover:border-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{cameraActive ? 'Camera Connected' : 'Connect Real Webcam'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {scanStep === 'idle' && (
                  <button
                    id="btn-start-scan"
                    onClick={startScanFlow}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>START 3D SCAN</span>
                  </button>
                )}

                {scanStep !== 'idle' && scanStep !== 'complete' && (
                  <div className="flex items-center gap-2 text-indigo-600 text-xs font-black animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>CALIBRATING SENSORS...</span>
                  </div>
                )}

                {scanStep === 'complete' && (
                  <button
                    onClick={() => {
                      setScanStep('idle');
                      setScanProgress(0);
                    }}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scan Again</span>
                  </button>
                )}
              </div>
            </div>

            {cameraError && (
              <p className="text-[11px] text-amber-600 font-bold mt-2">
                {cameraError}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: 3D Avatar Customization & Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Twin Customization
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                ACTIVE CONFIG
              </span>
            </div>

            {/* Avatar Preview Canvas */}
            <div className="h-[260px] rounded-xl bg-slate-900 relative overflow-hidden border border-slate-800">
              <DigitalTwinCanvas
                avatarConfig={{
                  ...avatarConfig,
                  colorTheme: activeTheme,
                  renderStyle: renderStyle,
                  heightCm,
                  wingspanCm,
                }}
                exercise="squats"
                interactive={true}
                showPedestal={true}
                zoom={1.1}
              />
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/80 border border-slate-700 text-[10px] font-black text-white flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-indigo-400" />
                <span>INTERACTIVE 3D</span>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="space-y-4 text-xs">
              {/* Avatar Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  AVATAR DESIGNATION
                </label>
                <input
                  type="text"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:border-slate-900 focus:outline-none"
                  placeholder="e.g. AURA Twin Alpha"
                />
              </div>

              {/* Hologram Spectrum */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  HOLOGRAPHIC SPECTRUM
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['cyan', 'violet', 'emerald', 'amber'] as const).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setActiveTheme(color);
                        playSound('click');
                      }}
                      className={`py-2 px-1 rounded-xl border text-center font-bold capitalize text-xs transition-all ${
                        activeTheme === color
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mesh Style */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  RENDERING TOPOLOGY
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['wireframe', 'cyber_mesh', 'hologram_core'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => {
                        setRenderStyle(style);
                        playSound('click');
                      }}
                      className={`py-2 px-1 rounded-xl border text-center font-bold text-[10px] uppercase tracking-wider transition-all ${
                        renderStyle === style
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {style.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Biometrics */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-slate-500 font-bold mb-1">
                    <span className="text-[10px] uppercase">HEIGHT</span>
                    <span className="text-slate-900 font-black">{heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="210"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-500 font-bold mb-1">
                    <span className="text-[10px] uppercase">WINGSPAN</span>
                    <span className="text-slate-900 font-black">{wingspanCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="220"
                    value={wingspanCm}
                    onChange={(e) => setWingspanCm(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                id="btn-save-twin"
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-widest hover:bg-indigo-600 shadow-sm transition-all"
              >
                <span>SAVE TWIN & LAUNCH WORKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
