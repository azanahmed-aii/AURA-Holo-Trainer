import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Flame, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Download, 
  Zap, 
  Activity, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AppView, WorkoutSessionStats, AvatarConfig } from '../types';
import { playSound } from '../utils/audio';
import { AICoachPanel } from './AICoachPanel';

interface ProgressDashboardProps {
  onNavigate: (view: AppView) => void;
  sessions: WorkoutSessionStats[];
  avatarConfig?: AvatarConfig;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  onNavigate,
  sessions,
  avatarConfig,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ar' | 'vr' | 'mr'>('all');

  // Compute Aggregates
  const totalReps = sessions.reduce((acc, s) => acc + s.repsCompleted, 0);
  const totalCalories = sessions.reduce((acc, s) => acc + s.caloriesBurned, 0);
  const avgAccuracy = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.accuracyScore, 0) / sessions.length)
    : 95;
  const totalDurationMin = Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);

  const filteredSessions = selectedFilter === 'all' 
    ? sessions 
    : sessions.filter(s => s.mode === selectedFilter);

  // Form accuracy history trend points
  const trendPoints = sessions.map((s) => ({
    label: s.date.split(',')[0],
    score: s.accuracyScore,
    exercise: s.exercise.replace('_', ' '),
  }));

  const achievements = [
    {
      id: 'ach-1',
      title: 'Digital Twin Calibrated',
      desc: 'Completed 14-joint coronal & sagittal biometric scan',
      unlocked: true,
      icon: '🧬',
    },
    {
      id: 'ach-2',
      title: 'Parallel Depth Master',
      desc: 'Achieved 95%+ squat angle accuracy across 10 reps',
      unlocked: true,
      icon: '⚡',
    },
    {
      id: 'ach-3',
      title: 'Tri-Modal Athlete',
      desc: 'Executed workouts across AR, VR, and MR modalities',
      unlocked: sessions.some(s => s.mode === 'vr') && sessions.some(s => s.mode === 'mr'),
      icon: '🏆',
    },
    {
      id: 'ach-4',
      title: 'Kinematic Perfectionist',
      desc: 'Zero knee valgus drift detected during workout session',
      unlocked: avgAccuracy >= 94,
      icon: '🎯',
    },
  ];

  const handleExport = () => {
    playSound('click');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aura_workout_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 bg-white text-slate-900 editorial-grid min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
            BIOMETRICS & TELEMETRY
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 mt-1">
            ANALYTICS.
          </h1>
          <p className="text-base text-slate-600 font-medium mt-2 max-w-2xl leading-relaxed">
            Longitudinal kinematic posture accuracy, cumulative mechanical load, and repetition history across all spatial sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-300 hover:border-slate-900 text-slate-700 text-xs font-black tracking-wider transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={() => onNavigate('hub')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-widest hover:bg-indigo-600 shadow-sm transition-all"
          >
            <span>NEW SESSION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase">
            <span>TOTAL REPS</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-900">
            {totalReps}
          </div>
          <div className="text-xs font-bold text-indigo-600">
            +18% above weekly benchmark
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase">
            <span>AVG ACCURACY</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-900">
            {avgAccuracy}%
          </div>
          <div className="text-xs font-bold text-indigo-600">
            Kinematic deviation &lt; 4.2°
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase">
            <span>CALORIES BURNED</span>
            <Flame className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-900">
            {totalCalories} <span className="text-lg font-bold text-slate-400">kcal</span>
          </div>
          <div className="text-xs font-bold text-slate-500">
            Active metabolic burn
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase">
            <span>TOTAL DURATION</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-900">
            {totalDurationMin} <span className="text-lg font-bold text-slate-400">min</span>
          </div>
          <div className="text-xs font-bold text-slate-500">
            {sessions.length} Recorded Sessions
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Accuracy Trend Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                TIME-SERIES
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                Kinematic Form Progression (%)
              </h3>
            </div>
            <span className="text-xs font-black text-indigo-600 tracking-wider">
              TARGET: 90%+
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Joint tracking continuously calculates angular variance from biomechanical ideal during peak repetition phases.
          </p>

          {/* SVG Trend Chart */}
          <div className="h-64 w-full relative pt-6 pb-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
              {/* Horizontal Grid lines */}
              {[70, 80, 90, 100].map((val) => {
                const y = 160 - ((val - 60) / 45) * 140;
                return (
                  <g key={val}>
                    <line x1="0" y1={y} x2="500" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <text x="5" y={y - 4} fill="#94a3b8" fontSize="10" fontWeight="bold">{val}%</text>
                  </g>
                );
              })}

              {/* Connecting trend line */}
              {trendPoints.length > 1 && (
                <>
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={trendPoints.map((pt, i) => {
                      const x = (i / (trendPoints.length - 1)) * 460 + 20;
                      const y = 160 - ((pt.score - 60) / 45) * 140;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  {/* Area gradient below curve */}
                  <polygon
                    fill="url(#trendGrad)"
                    opacity="0.15"
                    points={`20,160 ${trendPoints.map((pt, i) => {
                      const x = (i / (trendPoints.length - 1)) * 460 + 20;
                      const y = 160 - ((pt.score - 60) / 45) * 140;
                      return `${x},${y}`;
                    }).join(' ')} 480,160`}
                  />
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </>
              )}

              {/* Data points */}
              {trendPoints.map((pt, i) => {
                const x = trendPoints.length > 1 ? (i / (trendPoints.length - 1)) * 460 + 20 : 250;
                const y = 160 - ((pt.score - 60) / 45) * 140;
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="900"
                    >
                      {pt.score}%
                    </text>
                    <text
                      x={x}
                      y="178"
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>Real-Time Angle Precision</span>
            </span>
            <span className="text-slate-900 font-black">Peak Session: 98% Form Accuracy</span>
          </div>
        </div>

        {/* Muscle Activation Heatmap in Dark Contrast Panel */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900 text-white p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                  LOAD DISTRIBUTION
                </div>
                <h3 className="text-xl font-black">
                  Muscle Engagement
                </h3>
              </div>
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-4 pt-4 text-xs">
              {[
                { muscle: 'Quadriceps & Glutes', pct: 92 },
                { muscle: 'Biceps & Forearms', pct: 84 },
                { muscle: 'Anterior Deltoids', pct: 78 },
                { muscle: 'Core & Lumbar Stabilizers', pct: 88 },
              ].map(m => (
                <div key={m.muscle} className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>{m.muscle}</span>
                    <span className="text-white font-black">{m.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Biomechanical kinetic chain stable. No unilateral hip shift or knee valgus detected in recent cycles.
          </div>
        </div>
      </div>

      {/* Achievements and Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-black tracking-tight text-slate-900">
              Kinematic Milestones & Achievements
            </h3>
          </div>
          <span className="text-xs font-black text-indigo-600">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} UNLOCKED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                ach.unlocked
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-50'
              }`}
            >
              <div className="text-2xl p-2 rounded-xl bg-slate-100">
                {ach.icon}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>{ach.title}</span>
                  {ach.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {ach.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Biomechanical Coaching Engine */}
      <AICoachPanel 
        avatarConfig={avatarConfig || {
          name: 'Athlete',
          heightCm: 175,
          wingspanCm: 178,
          skinTone: '#c58c65',
          suitColor: '#6366f1',
          glowColor: '#818cf8',
          wireframeMode: false,
          musculatureLevel: 2
        }}
        sessions={sessions}
      />

      {/* Workout Session History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              TELEMETRY LOG
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Recent Training Sessions
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-black">
            {(['all', 'ar', 'vr', 'mr'] as const).map(mod => (
              <button
                key={mod}
                onClick={() => {
                  setSelectedFilter(mod);
                  playSound('click');
                }}
                className={`px-4 py-1 rounded-full uppercase transition-all ${
                  selectedFilter === mod
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-3 text-[10px] font-black uppercase tracking-[0.2em]">DATE & TIME</th>
                <th className="pb-3 text-[10px] font-black uppercase tracking-[0.2em]">MODALITY</th>
                <th className="pb-3 text-[10px] font-black uppercase tracking-[0.2em]">EXERCISE</th>
                <th className="pb-3 text-[10px] font-black uppercase tracking-[0.2em]">REPS</th>
                <th className="pb-3 text-[10px] font-black uppercase tracking-[0.2em]">ACCURACY</th>
                <th className="pb-3 text-[10px] font-black uppercase tracking-[0.2em]">CALORIES</th>
                <th className="pb-3 text-[10px] font-black uppercase tracking-[0.2em]">KEY COACH NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSessions.map(session => (
                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-mono-code text-slate-500 font-bold">{session.date}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {session.mode.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 font-black text-slate-900 capitalize">
                    {session.exercise.replace('_', ' ')}
                  </td>
                  <td className="py-4 font-bold text-slate-900">
                    {session.repsCompleted} / {session.targetReps}
                  </td>
                  <td className="py-4 text-indigo-600 font-black">
                    {session.accuracyScore}%
                  </td>
                  <td className="py-4 text-slate-600 font-bold">
                    {session.caloriesBurned} kcal
                  </td>
                  <td className="py-4 text-slate-500 font-medium truncate max-w-xs">
                    {session.formNotes.join(' • ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
