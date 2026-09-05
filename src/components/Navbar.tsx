import React from 'react';
import { 
  Dna, 
  Glasses, 
  Scan, 
  BarChart3, 
  Settings, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { AppView, DeviceXRStatus } from '../types';
import { playSound } from '../utils/audio';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  xrStatus: DeviceXRStatus;
  voiceCoachEnabled: boolean;
  onToggleVoiceCoach: () => void;
  digitalTwinSynced: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  xrStatus,
  voiceCoachEnabled,
  onToggleVoiceCoach,
  digitalTwinSynced,
}) => {
  const handleNav = (view: AppView) => {
    playSound('click');
    onNavigate(view);
  };

  const navItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'hub', label: 'Mode Hub', icon: Layers },
    { id: 'ar', label: 'AR Coach', icon: Scan },
    { id: 'vr', label: 'VR Gym', icon: Glasses },
    { id: 'mr', label: 'MR Equipment', icon: Sparkles },
    { id: 'setup', label: 'Twin Scanner', icon: Dna },
    { id: 'dashboard', label: 'AI Coach & Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div 
          onClick={() => handleNav('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-indigo-600 transition-colors">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">
                AURA<span className="text-indigo-600">.</span>TRAINER
              </span>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-[0.2em]">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 tracking-tight hidden sm:block">
              Kinematic Digital Twin & WebXR Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Digital Twin Sync Pill */}
          <button
            onClick={() => handleNav('setup')}
            title="Digital Twin status"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-300 transition-colors shadow-sm"
          >
            <span className={`w-2 h-2 rounded-full ${digitalTwinSynced ? 'bg-indigo-600 animate-pulse' : 'bg-amber-500'}`} />
            <span className="hidden sm:inline text-slate-400 font-semibold">Twin:</span>
            <span className={digitalTwinSynced ? 'text-indigo-600 font-black' : 'text-amber-600 font-black'}>
              {digitalTwinSynced ? 'ONLINE' : 'CALIBRATE'}
            </span>
          </button>

          {/* WebXR Badge */}
          <div 
            title={xrStatus.webxrSupported ? 'WebXR supported by hardware/browser' : 'Device in WebXR 3D-Fallback mode'}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${xrStatus.webxrSupported ? 'bg-indigo-600' : 'bg-slate-400'}`} />
            <span>{xrStatus.webxrSupported ? 'WebXR Ready' : '3D Fallback'}</span>
          </div>

          {/* Voice Coach Toggle */}
          <button
            id="btn-toggle-voice"
            onClick={() => {
              playSound('click');
              onToggleVoiceCoach();
            }}
            title={voiceCoachEnabled ? 'Voice Coach Active (Click to mute)' : 'Voice Coach Muted'}
            className={`p-2 rounded-xl border transition-all ${
              voiceCoachEnabled
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            {voiceCoachEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation bottom bar / scrollable pill row */}
      <div className="lg:hidden flex items-center gap-1.5 px-4 py-2 border-t border-slate-200 bg-slate-50 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
