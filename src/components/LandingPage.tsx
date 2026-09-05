import React from 'react';
import { 
  Scan, 
  Glasses, 
  Sparkles, 
  ArrowRight, 
  Dna, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { AppView, AvatarConfig, DeviceXRStatus } from '../types';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { playSound } from '../utils/audio';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  avatarConfig: AvatarConfig;
  xrStatus: DeviceXRStatus;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  avatarConfig,
  xrStatus,
}) => {
  const handleLaunch = (view: AppView) => {
    playSound('hologram_on');
    onNavigate(view);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-white text-slate-900 editorial-grid pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 relative z-10">
        
        {/* Status Bar / Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="text-xs font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded tracking-widest">
              SYSTEM ACTIVE
            </div>
            <div className="text-sm font-bold text-slate-400 font-mono-code">
              / spatial_engine / kinematics_v2.4 / twin_online
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLaunch('setup')}
              className="text-xs font-black tracking-widest text-slate-400 px-4 py-2 hover:text-slate-900 transition-colors"
            >
              CALIBRATE
            </button>
            <button
              onClick={() => handleLaunch('hub')}
              className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black tracking-widest hover:bg-indigo-600 transition-colors"
            >
              LAUNCH HUB
            </button>
          </div>
        </div>

        {/* Hero Section with Bold Typography Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                TRI-MODAL SPATIAL BIOMETRICS
              </div>
              <h1 className="text-6xl sm:text-8xl lg:text-[105px] font-black tracking-tighter leading-[0.85] text-slate-900">
                HOLO.<br/>TRAINER.
              </h1>
              <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                A real-time kinematic digital twin that mirrors your joint flexion angles, overlays millimeter-accurate posture correction in AR, and transports you into immersive WebXR training spaces.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="btn-launch-hub"
                onClick={() => handleLaunch('hub')}
                className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3.5 rounded-full text-xs font-black tracking-widest hover:bg-indigo-600 shadow-sm hover:shadow-indigo-500/20 transition-all duration-200"
              >
                <span>OPEN TRAINING HUB</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-scan-twin"
                onClick={() => handleLaunch('setup')}
                className="flex items-center gap-2.5 border border-slate-300 hover:border-slate-900 text-slate-700 hover:text-slate-900 font-black tracking-widest text-xs px-6 py-3.5 rounded-full transition-all"
              >
                <Dna className="w-4 h-4 text-indigo-600" />
                <span>BIOMETRIC SCAN</span>
              </button>

              <button
                id="btn-quick-ar"
                onClick={() => handleLaunch('ar')}
                className="text-xs font-black tracking-widest text-slate-400 hover:text-slate-900 px-4 py-3 transition-colors"
              >
                INSTANT AR →
              </button>
            </div>

            {/* High-Contrast Bold Metric Row */}
            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-slate-200">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  TRACKING LATENCY
                </div>
                <div className="text-4xl font-black text-slate-900">
                  16<span className="text-sm font-bold text-slate-400">ms</span>
                </div>
                <div className="text-[11px] font-black text-indigo-600">
                  60 FPS KINEMATICS
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  POSE LANDMARKS
                </div>
                <div className="text-4xl font-black text-slate-900">
                  14<span className="text-sm font-bold text-slate-400">joints</span>
                </div>
                <div className="text-[11px] font-black text-indigo-600">
                  VECTOR JOINT ARCS
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  HARDWARE STACK
                </div>
                <div className="text-4xl font-black text-slate-900">
                  {xrStatus.webxrSupported ? 'XR' : '3D'}
                </div>
                <div className="text-[11px] font-black text-indigo-600">
                  ZERO PLUGINS
                </div>
              </div>
            </div>
          </div>

          {/* 3D Hologram Frame in Bold Editorial Card */}
          <div className="lg:col-span-5 relative">
            <div className="border border-slate-200 rounded-2xl bg-white p-4 shadow-sm space-y-3">
              {/* Header inside frame */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    DIGITAL TWIN // {avatarConfig.name.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400">
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>DRAG TO ROTATE</span>
                </div>
              </div>

              {/* 3D Canvas Box in Deep Ink Background */}
              <div className="h-[380px] sm:h-[420px] w-full rounded-xl bg-slate-900 relative overflow-hidden">
                <DigitalTwinCanvas
                  avatarConfig={avatarConfig}
                  exercise="squats"
                  interactive={true}
                  showPedestal={true}
                  zoom={1.05}
                />

                {/* Floating pill tags */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="px-3 py-1 rounded-full bg-black/80 border border-slate-700 text-[11px] font-black text-white backdrop-blur-md">
                    <span className="text-slate-400">BIO-SYNC: </span>
                    <span className="text-indigo-400">99.4%</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-black/80 border border-slate-700 text-[11px] font-black text-white backdrop-blur-md">
                    <span>DEMO: SQUAT KINEMATICS</span>
                  </div>
                </div>
              </div>

              {/* Calibration footer */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-bold">
                  <Dna className="w-4 h-4 text-indigo-600" />
                  <span>Height: {avatarConfig.heightCm}cm • Wingspan: {avatarConfig.wingspanCm}cm</span>
                </div>
                <button
                  onClick={() => handleLaunch('setup')}
                  className="text-indigo-600 hover:text-indigo-800 font-black tracking-wider text-[11px] flex items-center gap-1"
                >
                  <span>RE-CALIBRATE</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* The 3 Immersive Modalities with Bold Typography */}
        <div className="mt-28 space-y-10">
          <div className="max-w-2xl">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
              MODALITY ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900">
              ONE TWIN. THREE MODES.
            </h2>
            <p className="text-base text-slate-600 font-medium mt-3 leading-relaxed">
              Seamlessly pivot between webcam AR tracking, full WebXR virtual gyms, and mixed-reality spatial equipment anchoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AR Mode Card */}
            <div 
              onClick={() => handleLaunch('ar')}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200 p-8 hover:border-slate-900 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Scan className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    LIVE TRACKING
                  </span>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    AR Coach
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mt-2">
                    Superimposes joint angle arcs, form skeletons, and repetition counters directly over your camera feed with sub-second feedback.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Dynamic Skeleton Wireframe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Cadence Rep State Machine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Digital Twin Mirror Sync</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-black tracking-widest text-slate-900">
                <span>ENTER AR SESSION</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* VR Mode Card */}
            <div 
              onClick={() => handleLaunch('vr')}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200 p-8 hover:border-slate-900 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Glasses className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    WEBXR + 3D
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    VR Virtual Gym
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mt-2">
                    Step inside a 3D training space featuring a rigged holographic trainer avatar demonstrating exercise cadence and joint paths.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Interactive 3D Virtual Gym Scene</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Demonstration Pacing Controls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>WebXR Headset Immersion Session</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-black tracking-widest text-slate-900">
                <span>ENTER VR GYM</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* MR Mode Card */}
            <div 
              onClick={() => handleLaunch('mr')}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200 p-8 hover:border-slate-900 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    PASS-THROUGH
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    MR Equipment
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mt-2">
                    Detects real physical equipment through your camera pass-through and anchors a holographic coach next to each station for posture analysis.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Spatial Equipment Bounding Boxes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Grip & Stance Biomechanical Guides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Composited Hologram Coach</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-black tracking-widest text-slate-900">
                <span>ENTER MR COMPOSITE</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* High-Contrast Dark Feature Section inspired by Design HTML */}
        <div className="mt-20 p-8 sm:p-10 bg-slate-900 rounded-3xl text-white space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
                SYSTEM INTELLIGENCE
              </div>
              <h3 className="text-3xl font-black tracking-tight">
                Kinematic Accuracy & Verification Matrix
              </h3>
            </div>
            <div className="text-xs font-mono-code font-bold text-slate-400">
              BUILD // VERIFIED 2026.09
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                LIVE FUNCTIONAL
              </div>
              <div className="font-bold text-base text-white">AR Kinematics</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates real-time joint angles (knees, elbows, shoulders) via trigonometric vector math and powers the rep state machine.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                LIVE FUNCTIONAL
              </div>
              <div className="font-bold text-base text-white">3D Avatar Rig</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Procedurally rigged 14-bone humanoid mesh with dynamic rotations, wireframe materials, and real-time posture mirroring.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                LIVE FUNCTIONAL
              </div>
              <div className="font-bold text-base text-white">WebXR & Audio</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                WebXR session negotiation, Web Audio oscillator chimes, and Web Speech Synthesis voice coaching cues.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                SIMULATED DEMO
              </div>
              <div className="font-bold text-base text-white">LiDAR Scanner</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Demonstrates high-fidelity body mesh synthesis flow with camera pass-through and biometric wingspan calibration.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
