/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, AvatarConfig, ExerciseType, DeviceXRStatus, WorkoutSessionStats } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DigitalTwinSetup } from './components/DigitalTwinSetup';
import { ModeSelectorHub } from './components/ModeSelectorHub';
import { ARView } from './components/ARView';
import { VRView } from './components/VRView';
import { MRView } from './components/MRView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ProfileSettings } from './components/ProfileSettings';

const DEFAULT_AVATAR: AvatarConfig = {
  name: 'AURA-01 Nexus',
  colorTheme: 'cyan',
  renderStyle: 'wireframe',
  heightCm: 178,
  wingspanCm: 182,
  glowIntensity: 0.85,
  scanDate: '2026-09-04T12:00:00.000Z',
  syncLevel: 99.4,
};

const INITIAL_SESSIONS: WorkoutSessionStats[] = [
  {
    id: 's-1',
    date: 'Sep 3, 08:30 AM',
    exercise: 'squats',
    mode: 'ar',
    repsCompleted: 12,
    targetReps: 12,
    accuracyScore: 97,
    durationSeconds: 94,
    caloriesBurned: 48,
    formNotes: ['Optimal knee flexion angle 84°', 'Consistent vertical bar path', 'Heels anchored'],
  },
  {
    id: 's-2',
    date: 'Sep 3, 05:15 PM',
    exercise: 'bicep_curls',
    mode: 'vr',
    repsCompleted: 10,
    targetReps: 10,
    accuracyScore: 94,
    durationSeconds: 78,
    caloriesBurned: 36,
    formNotes: ['Elbows pinned to ribs', 'Zero lumbar compensation', 'Controlled eccentric descent'],
  },
  {
    id: 's-3',
    date: 'Sep 4, 09:00 AM',
    exercise: 'shoulder_press',
    mode: 'mr',
    repsCompleted: 10,
    targetReps: 10,
    accuracyScore: 96,
    durationSeconds: 82,
    caloriesBurned: 42,
    formNotes: ['Spatial equipment anchoring solid', 'Lockout achieved without arching ribs'],
  },
  {
    id: 's-4',
    date: 'Sep 4, 06:20 PM',
    exercise: 'squats',
    mode: 'ar',
    repsCompleted: 15,
    targetReps: 15,
    accuracyScore: 98,
    durationSeconds: 112,
    caloriesBurned: 62,
    formNotes: ['Flawless parallel depth', 'Drive phase speed balanced', 'Clean torso angle'],
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem('aura_avatar_config');
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR;
    } catch {
      return DEFAULT_AVATAR;
    }
  });

  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squats');
  const [targetReps, setTargetReps] = useState<number>(10);
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState<boolean>(true);
  const [digitalTwinSynced, setDigitalTwinSynced] = useState<boolean>(true);

  const [sessions, setSessions] = useState<WorkoutSessionStats[]>(() => {
    try {
      const saved = localStorage.getItem('aura_workout_sessions');
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  // Device & XR Status detection
  const [xrStatus, setXrStatus] = useState<DeviceXRStatus>({
    webxrSupported: false,
    vrSupported: false,
    arSupported: false,
    cameraAvailable: false,
    motionSupported: true,
  });

  useEffect(() => {
    // Check WebXR
    if (typeof navigator !== 'undefined' && 'xr' in navigator && navigator.xr) {
      Promise.all([
        navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
        navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
      ]).then(([vr, ar]) => {
        setXrStatus(prev => ({
          ...prev,
          webxrSupported: vr || ar,
          vrSupported: vr,
          arSupported: ar,
        }));
      });
    }

    // Check Camera
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const hasCam = devices.some(d => d.kind === 'videoinput');
        setXrStatus(prev => ({ ...prev, cameraAvailable: hasCam }));
      }).catch(() => {});
    }
  }, []);

  const handleSaveAvatar = (newConfig: AvatarConfig) => {
    setAvatarConfig(newConfig);
    setDigitalTwinSynced(true);
    try {
      localStorage.setItem('aura_avatar_config', JSON.stringify(newConfig));
    } catch {
      // localStorage may fail in sandboxes
    }
  };

  const handleSaveSession = (newSession: WorkoutSessionStats) => {
    const updated = [newSession, ...sessions];
    setSessions(updated);
    try {
      localStorage.setItem('aura_workout_sessions', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleResetData = () => {
    setAvatarConfig(DEFAULT_AVATAR);
    setSessions(INITIAL_SESSIONS);
    try {
      localStorage.removeItem('aura_avatar_config');
      localStorage.removeItem('aura_workout_sessions');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        xrStatus={xrStatus}
        voiceCoachEnabled={voiceCoachEnabled}
        onToggleVoiceCoach={() => setVoiceCoachEnabled(!voiceCoachEnabled)}
        digitalTwinSynced={digitalTwinSynced}
      />

      {/* Main App View Routing */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={setCurrentView}
            avatarConfig={avatarConfig}
            xrStatus={xrStatus}
          />
        )}

        {currentView === 'setup' && (
          <DigitalTwinSetup
            avatarConfig={avatarConfig}
            onSaveAvatar={handleSaveAvatar}
            onComplete={() => setCurrentView('hub')}
          />
        )}

        {currentView === 'hub' && (
          <ModeSelectorHub
            onNavigate={setCurrentView}
            selectedExercise={selectedExercise}
            onSelectExercise={setSelectedExercise}
            targetReps={targetReps}
            onSelectTargetReps={setTargetReps}
            xrStatus={xrStatus}
          />
        )}

        {currentView === 'ar' && (
          <ARView
            onNavigate={setCurrentView}
            avatarConfig={avatarConfig}
            exercise={selectedExercise}
            targetReps={targetReps}
            voiceCoachEnabled={voiceCoachEnabled}
            onSaveSession={handleSaveSession}
          />
        )}

        {currentView === 'vr' && (
          <VRView
            onNavigate={setCurrentView}
            avatarConfig={avatarConfig}
            exercise={selectedExercise}
            targetReps={targetReps}
            xrStatus={xrStatus}
            voiceCoachEnabled={voiceCoachEnabled}
            onSaveSession={handleSaveSession}
          />
        )}

        {currentView === 'mr' && (
          <MRView
            onNavigate={setCurrentView}
            avatarConfig={avatarConfig}
            exercise={selectedExercise}
            targetReps={targetReps}
            voiceCoachEnabled={voiceCoachEnabled}
            onSaveSession={handleSaveSession}
          />
        )}

        {currentView === 'dashboard' && (
          <ProgressDashboard
            onNavigate={setCurrentView}
            sessions={sessions}
            avatarConfig={avatarConfig}
          />
        )}

        {currentView === 'settings' && (
          <ProfileSettings
            avatarConfig={avatarConfig}
            onSaveAvatar={handleSaveAvatar}
            xrStatus={xrStatus}
            voiceCoachEnabled={voiceCoachEnabled}
            onToggleVoiceCoach={() => setVoiceCoachEnabled(!voiceCoachEnabled)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Bold Typography Persistent Status Footer */}
      <footer className="w-full border-t border-slate-200 bg-slate-50 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-indigo-600 font-black tracking-tighter text-sm">AURA.TRAINER</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-700">SPATIAL BIOMETRIC CORE</span>
            <span className="text-slate-300">/</span>
            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] bg-indigo-50 px-2 py-0.5 rounded">ONLINE</span>
          </div>

          <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
            <button onClick={() => setCurrentView('landing')} className="hover:text-slate-900 transition-colors">Overview</button>
            <button onClick={() => setCurrentView('setup')} className="hover:text-slate-900 transition-colors">Biometrics</button>
            <button onClick={() => setCurrentView('dashboard')} className="hover:text-slate-900 transition-colors">Analytics</button>
            <button onClick={() => setCurrentView('settings')} className="hover:text-slate-900 transition-colors">Config</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
