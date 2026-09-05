import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  Layers, 
  Maximize2
} from 'lucide-react';
import { AppView, AvatarConfig, ExerciseType, WorkoutSessionStats } from '../types';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { playSound, speakCue } from '../utils/audio';

interface MRViewProps {
  onNavigate: (view: AppView) => void;
  avatarConfig: AvatarConfig;
  exercise: ExerciseType;
  targetReps: number;
  voiceCoachEnabled: boolean;
  onSaveSession: (session: WorkoutSessionStats) => void;
}

interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number }; // percentages
  gripAdvice: string;
  hologramOffset: { x: number; y: number };
}

export const MRView: React.FC<MRViewProps> = ({
  onNavigate,
  avatarConfig,
  exercise,
  targetReps,
  voiceCoachEnabled,
  onSaveSession,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string>('obj-dumbbells');
  const [repsDone, setRepsDone] = useState(5);
  const [startTime] = useState(Date.now());

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulated detected real-world equipment
  const detectedObjects: DetectedObject[] = [
    {
      id: 'obj-dumbbells',
      name: 'Free Weights / Dumbbells',
      confidence: 98.4,
      box: { x: 18, y: 38, width: 26, height: 28 },
      gripAdvice: 'Neutral Grip: align wrists linearly with forearms. Avoid hyperextending wrists under load.',
      hologramOffset: { x: 58, y: 20 },
    },
    {
      id: 'obj-bench',
      name: 'Incline Bench',
      confidence: 96.1,
      box: { x: 54, y: 46, width: 34, height: 36 },
      gripAdvice: 'Set incline to 30°. Retract and depress scapulae, maintaining active lumbar arch.',
      hologramOffset: { x: 22, y: 15 },
    },
    {
      id: 'obj-mat',
      name: 'Stance Mat',
      confidence: 99.2,
      box: { x: 30, y: 72, width: 42, height: 22 },
      gripAdvice: 'Tripod Foot Placement: distribute weight evenly across heel, big toe base, and outer foot edge.',
      hologramOffset: { x: 74, y: 35 },
    },
  ];

  const activeObject = detectedObjects.find(o => o.id === selectedObjectId) || detectedObjects[0];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      playSound('click');
      speakCue('Camera pass-through active. Equipment detected.');
    } catch {
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleSelectObject = (obj: DetectedObject) => {
    setSelectedObjectId(obj.id);
    playSound('click');
    if (voiceCoachEnabled) {
      speakCue(`Holographic coach anchored to ${obj.name}. ${obj.gripAdvice.split('.')[0]}`);
    }
  };

  const handleFinish = () => {
    const duration = Math.max(15, Math.round((Date.now() - startTime) / 1000));
    onSaveSession({
      id: `session-mr-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      exercise,
      mode: 'mr',
      repsCompleted: repsDone,
      targetReps,
      accuracyScore: 97,
      durationSeconds: duration,
      caloriesBurned: Math.round(repsDone * 3.5 + duration * 0.12),
      formNotes: ['Spatial equipment anchoring confirmed', 'Grip posture corrected'],
    });
    playSound('success');
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 bg-white text-slate-900 editorial-grid min-h-[calc(100vh-4rem)]">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('hub')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-black tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT TO HUB</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-black text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MR PASS-THROUGH // SPATIAL ANCHORS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black tracking-wider border transition-colors ${
              cameraActive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-900'
            }`}
          >
            {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span>{cameraActive ? 'Pass-through Live' : 'Enable Camera'}</span>
          </button>

          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
            EQUIPMENT RECOGNITION
          </span>
        </div>
      </div>

      {/* Main MR Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[4/3] sm:aspect-[16/10] shadow-md flex items-center justify-center">
          
          {/* Camera Pass-Through Video */}
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
              <div className="text-center space-y-3 p-6 z-10">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-white">
                  Mixed Reality Compositor Active
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Turn on your camera to see your room blended with spatial equipment detection boxes alongside your holographic coach.
                </p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white border border-slate-700 hover:bg-indigo-600 font-black text-xs tracking-wider shadow-sm transition-colors"
                >
                  Enable Real-World Pass-through
                </button>
              </div>
            </div>
          )}

          {/* Holographic Object Detection Bounding Boxes */}
          {detectedObjects.map(obj => {
            const isSelected = selectedObjectId === obj.id;
            return (
              <div
                key={obj.id}
                onClick={() => handleSelectObject(obj)}
                className={`absolute cursor-pointer transition-all duration-300 rounded-xl p-2.5 z-20 ${
                  isSelected
                    ? 'border-2 border-indigo-400 bg-indigo-950/40 shadow-lg'
                    : 'border border-slate-500/60 bg-black/40 hover:border-indigo-400'
                }`}
                style={{
                  left: `${obj.box.x}%`,
                  top: `${obj.box.y}%`,
                  width: `${obj.box.width}%`,
                  height: `${obj.box.height}%`,
                }}
              >
                {/* Object Tag Tagline */}
                <div className="absolute -top-7 left-0 px-2.5 py-0.5 rounded-full bg-black/85 border border-indigo-400 text-[10px] font-black text-white flex items-center gap-1.5 whitespace-nowrap shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>{obj.name}</span>
                  <span className="text-indigo-300 font-mono-code">[{obj.confidence}%]</span>
                </div>

                {/* Spatial Anchor Crosshairs */}
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-indigo-400" />

                {isSelected && (
                  <div className="h-full flex items-center justify-center">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-black text-[10px] tracking-wider">
                      COACH ANCHORED HERE
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Virtual Trainer Avatar Composited Inside Pass-Through */}
          <div 
            className="absolute z-20 w-48 sm:w-56 h-72 sm:h-80 pointer-events-none transition-all duration-700"
            style={{
              left: `${activeObject.hologramOffset.x}%`,
              top: `${activeObject.hologramOffset.y}%`,
            }}
          >
            <div className="w-full h-full relative">
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-36 h-8 bg-indigo-500/20 rounded-full blur-md" />
              
              <DigitalTwinCanvas
                avatarConfig={avatarConfig}
                exercise={exercise}
                interactive={false}
                showPedestal={true}
                zoom={1.2}
              />
            </div>
          </div>

          {/* Bottom Overlay Card: Grip & Stance Advice */}
          <div className="absolute bottom-4 left-4 right-4 z-30 p-3.5 rounded-xl bg-black/85 border border-slate-700 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                  SPATIAL BIOMECHANIC CORRECTION // {activeObject.name}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white max-w-xl">
                  {activeObject.gripAdvice}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => {
                  setRepsDone(r => r + 1);
                  playSound('rep');
                }}
                className="px-4 py-1.5 rounded-full bg-indigo-600 text-white font-black text-xs shadow-sm hover:bg-indigo-700 transition-colors"
              >
                + REP ({repsDone})
              </button>
            </div>
          </div>
        </div>

        {/* Right Info & Equipment List Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">DETECTED EQUIPMENT</span>
              <span className="text-indigo-600 font-black">3 ANCHORS FOUND</span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Click any detected real-world equipment anchor to reposition your holographic trainer next to it for tailored grip and posture analysis.
            </p>

            <div className="space-y-3">
              {detectedObjects.map(obj => {
                const isSelected = selectedObjectId === obj.id;
                return (
                  <div
                    key={obj.id}
                    onClick={() => handleSelectObject(obj)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {obj.name}
                      </span>
                      <span className={`text-[10px] font-black ${isSelected ? 'text-indigo-300' : 'text-indigo-600'}`}>
                        {obj.confidence}% match
                      </span>
                    </div>
                    <p className={`text-xs font-medium line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                      {obj.gripAdvice}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between text-xs font-bold">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider">Target Reps:</span>
              <span className="text-indigo-600 font-black">{repsDone} / {targetReps}</span>
            </div>

            <button
              onClick={handleFinish}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-widest hover:bg-indigo-600 shadow-sm transition-all"
            >
              <span>COMPLETE MR SESSION & SAVE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
