import React from 'react';
import { 
  Scan, 
  Glasses, 
  Sparkles, 
  Dumbbell, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Flame, 
  Target, 
  Zap
} from 'lucide-react';
import { AppView, DeviceXRStatus, ExerciseType, ExerciseInfo } from '../types';
import { playSound } from '../utils/audio';

interface ModeSelectorHubProps {
  onNavigate: (view: AppView) => void;
  selectedExercise: ExerciseType;
  onSelectExercise: (exercise: ExerciseType) => void;
  targetReps: number;
  onSelectTargetReps: (reps: number) => void;
  xrStatus: DeviceXRStatus;
}

export const EXERCISES: ExerciseInfo[] = [
  {
    id: 'squats',
    name: 'Kinematic Squats',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    description: 'Track hip-to-knee-to-ankle flexion with automated parallel depth detection.',
    targetReps: 10,
    primaryJoint: 'Knee (80° - 165°)',
    idealAngleRange: [80, 165],
  },
  {
    id: 'bicep_curls',
    name: 'Holo Bicep Curls',
    targetMuscles: ['Biceps Brachii', 'Forearms'],
    description: 'Pin elbows to ribs and monitor peak contraction with full extension feedback.',
    targetReps: 12,
    primaryJoint: 'Elbow (45° - 155°)',
    idealAngleRange: [45, 155],
  },
  {
    id: 'shoulder_press',
    name: 'Overhead Press',
    targetMuscles: ['Anterior Deltoid', 'Triceps', 'Upper Traps'],
    description: 'Assess overhead vertical trajectory and prevent hyperextension.',
    targetReps: 10,
    primaryJoint: 'Shoulder/Elbow (70° - 170°)',
    idealAngleRange: [70, 170],
  },
  {
    id: 'warrior_pose',
    name: 'Warrior II Alignment',
    targetMuscles: ['Hip Abductors', 'Core', 'Quads'],
    description: 'Isometric stance stabilization with real-time 90° lead knee angle guide.',
    targetReps: 30, // seconds
    primaryJoint: 'Lead Knee (90°)',
    idealAngleRange: [85, 105],
  },
];

export const ModeSelectorHub: React.FC<ModeSelectorHubProps> = ({
  onNavigate,
  selectedExercise,
  onSelectExercise,
  targetReps,
  onSelectTargetReps,
  xrStatus,
}) => {
  const handleSelectMode = (view: AppView) => {
    playSound('click');
    onNavigate(view);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 bg-white text-slate-900 editorial-grid min-h-[calc(100vh-4rem)]">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
            WORKSPACE // DISPATCH
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 mt-2">
            MODE HUB.
          </h1>
          <p className="text-base text-slate-600 font-medium mt-2 max-w-2xl leading-relaxed">
            Configure your target exercise biomechanics and launch into your preferred AR, VR, or MR training view.
          </p>
        </div>

        {/* Hardware Status Strip */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            {xrStatus.cameraAvailable ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-slate-700">Webcam: {xrStatus.cameraAvailable ? 'Active' : 'Fallback'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${xrStatus.webxrSupported ? 'bg-indigo-600' : 'bg-slate-400'}`} />
            <span className="text-slate-700">WebXR: {xrStatus.webxrSupported ? 'Supported' : '3D Mode'}</span>
          </div>
        </div>
      </div>

      {/* 1. Exercise & Parameters Selection */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              STEP 01
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Select Exercise Routine
            </h2>
          </div>
          <div className="text-xs font-black text-indigo-600 tracking-wider">
            4 PRESETS LOADED
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXERCISES.map((ex) => {
            const isSelected = selectedExercise === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => {
                  playSound('click');
                  onSelectExercise(ex.id);
                  onSelectTargetReps(ex.targetReps);
                }}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-600'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-400 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-black tracking-tight">
                      {ex.name}
                    </span>
                    {isSelected ? (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase">PRESET</span>
                    )}
                  </div>
                  <p className={`text-xs font-medium leading-relaxed mb-4 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {ex.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {ex.targetMuscles.map(m => (
                      <span 
                        key={m} 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected 
                            ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs font-mono-code ${
                  isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-500'
                }`}>
                  <span className="font-bold">Target Volume:</span>
                  <span className={`font-black ${isSelected ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {ex.targetReps} {ex.id === 'warrior_pose' ? 'sec' : 'reps'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reps selector */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
              <Target className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">Target Repetition Volume</div>
              <div className="text-xs font-medium text-slate-500">Tune target cadence before launching tracking session</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[8, 10, 12, 15, 20].map(reps => (
              <button
                key={reps}
                onClick={() => {
                  playSound('click');
                  onSelectTargetReps(reps);
                }}
                className={`px-4 py-2 rounded-full text-xs font-black tracking-wider transition-all ${
                  targetReps === reps
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {reps} REPS
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Three Large Interactive Mode Cards */}
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            STEP 02
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Launch Spatial Modality
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: AR Coach */}
          <div 
            id="card-mode-ar"
            onClick={() => handleSelectMode('ar')}
            className="group cursor-pointer rounded-2xl bg-white border border-slate-200 p-8 hover:border-slate-900 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Scan className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  LIVE TRACKING
                </span>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                AR Coach
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Webcam posture tracking. Live joint angle calculations for knees and elbows, real-time rep counting state machine, and instant voice form feedback.
              </p>

              <div className="space-y-2 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span>Hardware Input:</span>
                  <span className="text-slate-900 font-black">Webcam / Device Cam</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tracking Engine:</span>
                  <span className="text-indigo-600 font-black">14-Joint Kinematics</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Feedback Mode:</span>
                  <span className="text-indigo-600 font-black">Audio Speech + Visual HUD</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-slate-900 text-white group-hover:bg-indigo-600 font-black text-xs tracking-widest transition-all">
                <span>START AR WORKOUT</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: VR Gym */}
          <div 
            id="card-mode-vr"
            onClick={() => handleSelectMode('vr')}
            className="group cursor-pointer rounded-2xl bg-white border border-slate-200 p-8 hover:border-slate-900 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Glasses className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                  WEBXR + 3D
                </span>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                VR Gym
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Step into a high-fidelity virtual gym. A holographic coach demonstrates your selected exercise ({selectedExercise.replace('_', ' ')}) with tempo controls and WebXR headset support.
              </p>

              <div className="space-y-2 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span>Hardware Input:</span>
                  <span className="text-slate-900 font-black">WebXR Headset / 3D Canvas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trainer Avatar:</span>
                  <span className="text-indigo-600 font-black">Rigged 3D Hologram</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Environment:</span>
                  <span className="text-indigo-600 font-black">Virtual Gym Space + Weights</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-slate-900 text-white group-hover:bg-indigo-600 font-black text-xs tracking-widest transition-all">
                <span>ENTER VR GYM</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: MR Equipment */}
          <div 
            id="card-mode-mr"
            onClick={() => handleSelectMode('mr')}
            className="group cursor-pointer rounded-2xl bg-white border border-slate-200 p-8 hover:border-slate-900 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  PASS-THROUGH
                </span>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                MR Equipment
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Mixed reality pass-through. Blends your real gym space with holographic spatial anchors, computer vision equipment bounding boxes, and alongside coach compositing.
              </p>

              <div className="space-y-2 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span>Hardware Input:</span>
                  <span className="text-slate-900 font-black">Camera Pass-through</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Spatial Anchors:</span>
                  <span className="text-indigo-600 font-black">Object Bounding Mesh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Equipment Track:</span>
                  <span className="text-indigo-600 font-black">Dumbbells & Bench Detection</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-slate-900 text-white group-hover:bg-indigo-600 font-black text-xs tracking-widest transition-all">
                <span>LAUNCH MIXED REALITY</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
