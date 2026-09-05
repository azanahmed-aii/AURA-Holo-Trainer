import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Camera, 
  Glasses, 
  Volume2, 
  CheckCircle2, 
  Trash2,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { AvatarConfig, DeviceXRStatus } from '../types';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { playSound, speakCue } from '../utils/audio';

interface ProfileSettingsProps {
  avatarConfig: AvatarConfig;
  onSaveAvatar: (config: AvatarConfig) => void;
  xrStatus: DeviceXRStatus;
  voiceCoachEnabled: boolean;
  onToggleVoiceCoach: () => void;
  onResetData: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  avatarConfig,
  onSaveAvatar,
  xrStatus,
  voiceCoachEnabled,
  onToggleVoiceCoach,
  onResetData,
}) => {
  const [config, setConfig] = useState<AvatarConfig>(avatarConfig);
  const [sensitivity, setSensitivity] = useState<'strict' | 'balanced' | 'forgiving'>('balanced');
  const [savedAlert, setSavedAlert] = useState(false);

  const handleUpdate = <K extends keyof AvatarConfig>(field: K, val: AvatarConfig[K]) => {
    const updated = { ...config, [field]: val };
    setConfig(updated);
    onSaveAvatar(updated);
    playSound('click');
  };

  const handleSave = () => {
    onSaveAvatar(config);
    playSound('success');
    speakCue('Profile settings updated.');
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const testVoice = () => {
    playSound('rep');
    speakCue('AURA AI Voice Coach operational. Kinematics synchronized.', true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12 bg-white text-slate-900 editorial-grid min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
            SYSTEM CONFIGURATION
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 mt-1">
            SETTINGS.
          </h1>
          <p className="text-base text-slate-600 font-medium mt-2 max-w-2xl leading-relaxed">
            Configure visual emission parameters, audio coaching cadence, and hardware sensors.
          </p>
        </div>

        {savedAlert && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-black text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar Customization */}
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-lg">
                  Twin Visual Parameters
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                ACTIVE CONFIG
              </span>
            </div>

            {/* Avatar Designation */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                TWIN DESIGNATION / IDENTIFIER
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => handleUpdate('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:border-slate-900 focus:outline-none"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                HOLOGRAPHIC EMISSION SPECTRUM
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(['cyan', 'violet', 'emerald', 'amber'] as const).map(color => (
                  <button
                    key={color}
                    onClick={() => handleUpdate('colorTheme', color)}
                    className={`p-3 rounded-xl border text-center text-xs font-bold capitalize transition-all ${
                      config.colorTheme === color
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1.5 ${
                      color === 'cyan' ? 'bg-cyan-400' :
                      color === 'violet' ? 'bg-purple-400' :
                      color === 'emerald' ? 'bg-emerald-400' :
                      'bg-amber-400'
                    }`} />
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mesh Topology */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                RENDERING TOPOLOGY
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['wireframe', 'cyber_mesh', 'hologram_core'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => handleUpdate('renderStyle', style)}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-bold uppercase transition-all ${
                      config.renderStyle === style
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {style.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Calibration Sliders */}
            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span className="text-[10px] uppercase">HEIGHT</span>
                  <span className="text-slate-900 font-black">{config.heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={config.heightCm}
                  onChange={(e) => handleUpdate('heightCm', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span className="text-[10px] uppercase">WINGSPAN</span>
                  <span className="text-slate-900 font-black">{config.wingspanCm} cm</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="220"
                  value={config.wingspanCm}
                  onChange={(e) => handleUpdate('wingspanCm', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* AI Coaching & Accessibility Options */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-lg">
                  AI Coaching & Audio Synthesis
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                AUDIO ENGINE
              </span>
            </div>

            <div className="space-y-4">
              {/* Voice toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-sm font-black text-slate-900">
                    Synthesized Voice Coach
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    Spoken kinematic corrections and real-time rep cadence
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={testVoice}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:text-slate-900"
                  >
                    Test Voice
                  </button>
                  <button
                    onClick={onToggleVoiceCoach}
                    className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider transition-all ${
                      voiceCoachEnabled
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-500'
                    }`}
                  >
                    {voiceCoachEnabled ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>
              </div>

              {/* Angle Tolerance Sensitivity */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase text-[10px] tracking-wider">FORM STRICTNESS TOLERANCE</span>
                  <span className="text-indigo-600 uppercase font-black">{sensitivity}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['strict', 'balanced', 'forgiving'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        setSensitivity(mode);
                        playSound('click');
                      }}
                      className={`py-2 px-2 rounded-xl border text-center capitalize text-xs font-bold transition-all ${
                        sensitivity === mode
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Preview & Diagnostics */}
        <div className="lg:col-span-5 space-y-8">
          {/* Live Preview Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">LIVE PREVIEW</span>
              <span className="text-indigo-600 font-black">{config.name.toUpperCase()}</span>
            </div>

            <div className="h-[280px] rounded-xl bg-slate-900 relative overflow-hidden border border-slate-800">
              <DigitalTwinCanvas
                avatarConfig={config}
                exercise="squats"
                interactive={true}
                showPedestal={true}
                zoom={1.1}
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-widest hover:bg-indigo-600 shadow-sm transition-all"
            >
              SAVE PROFILE CHANGES
            </button>
          </div>

          {/* Hardware Diagnostics */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Hardware Diagnostics
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">PASSED</span>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>Webcam Stream Access</span>
                </span>
                <span className="text-emerald-600 font-black">READY</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <Glasses className="w-4 h-4 text-indigo-600" />
                  <span>WebXR Immersive Session</span>
                </span>
                <span className="text-indigo-600 font-black">
                  {xrStatus.webxrSupported ? 'SUPPORTED' : '3D MODE'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>WebGL Hardware Acceleration</span>
                </span>
                <span className="text-emerald-600 font-black">60 FPS</span>
              </div>
            </div>

            {/* Reset Data */}
            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  if (confirm('Reset all logged workout sessions and restore default avatar?')) {
                    onResetData();
                    playSound('click');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-black tracking-wider transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>RESET WORKOUT DATA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
