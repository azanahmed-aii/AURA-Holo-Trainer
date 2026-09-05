import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Sliders, 
  Maximize2, 
  ArrowLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AppView, AvatarConfig, ExerciseType, PoseKeypoints, WorkoutSessionStats } from '../types';
import { ExerciseTracker, generateProceduralKeypoints, calculateAngle } from '../utils/poseTracker';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { playSound, speakCue } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ARViewProps {
  onNavigate: (view: AppView) => void;
  avatarConfig: AvatarConfig;
  exercise: ExerciseType;
  targetReps: number;
  voiceCoachEnabled: boolean;
  onSaveSession: (session: WorkoutSessionStats) => void;
}

export const ARView: React.FC<ARViewProps> = ({
  onNavigate,
  avatarConfig,
  exercise,
  targetReps,
  voiceCoachEnabled,
  onSaveSession,
}) => {
  const [currentExercise, setCurrentExercise] = useState<ExerciseType>(exercise);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [manualDepth, setManualDepth] = useState(0.5); // 0 (up) to 1 (down)

  // Tracking telemetry
  const [reps, setReps] = useState(0);
  const [accuracy, setAccuracy] = useState(96);
  const [jointAngle, setJointAngle] = useState(160);
  const [feedback, setFeedback] = useState('Stand in frame. Beginning kinematic tracking.');
  const [repStage, setRepStage] = useState<'up' | 'down' | 'hold'>('up');
  const [sessionStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackLog, setFeedbackLog] = useState<string[]>([]);
  const [showTwinPip, setShowTwinPip] = useState(true);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<ExerciseTracker>(new ExerciseTracker(exercise));
  const currentKeypointsRef = useRef<PoseKeypoints | null>(null);
  const lastSpokenCueRef = useRef<string>('');

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setSimulationMode(false);
      playSound('click');
      speakCue('Camera connected. Posture skeleton active.');
    } catch {
      setCameraError('Camera access unavailable. Switched to automated kinematic simulator.');
      setCameraActive(false);
      setSimulationMode(true);
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
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Update tracker on exercise change
  useEffect(() => {
    trackerRef.current.setExercise(currentExercise);
    setReps(0);
    setAccuracy(96);
    setFeedback(`Selected ${currentExercise.replace('_', ' ')}. Begin when ready.`);
  }, [currentExercise]);

  // Main Tracking Loop & Canvas Rendering
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear overlay canvas
    ctx.clearRect(0, 0, width, height);

    // Get keypoints: either from simulated motion generator or camera feed
    const nowSec = Date.now() / 1000;
    const keypoints = generateProceduralKeypoints(
      nowSec, 
      currentExercise,
      simulationMode ? manualDepth : undefined
    );
    currentKeypointsRef.current = keypoints;

    // Process Kinematics with ExerciseTracker
    const analysis = trackerRef.current.processPose(keypoints);
    setJointAngle(analysis.currentAngle);
    setAccuracy(analysis.formAccuracy);
    setRepStage(analysis.stage);
    setFeedback(analysis.feedback);

    // Voice announcement logic
    if (voiceCoachEnabled && analysis.feedback !== lastSpokenCueRef.current) {
      if (analysis.isRepComplete) {
        playSound('rep');
        speakCue(`Rep ${trackerRef.current.getRepCount()}! Good form.`);
      }
      lastSpokenCueRef.current = analysis.feedback;
    }

    if (analysis.isRepComplete) {
      setReps(trackerRef.current.getRepCount());
      setFeedbackLog(prev => [analysis.feedback, ...prev.slice(0, 4)]);

      // Check if target reached
      if (trackerRef.current.getRepCount() >= targetReps && !isCompleted) {
        setIsCompleted(true);
        playSound('success');
        speakCue(`Goal achieved! ${targetReps} reps completed. Outstanding workout!`, true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }

    // DRAW SKELETON ON OVERLAY
    // Determine color based on form accuracy
    const isGoodForm = analysis.formAccuracy >= 88;
    const jointColor = isGoodForm ? '#06b6d4' : '#f59e0b';
    const boneColor = isGoodForm ? 'rgba(6, 182, 212, 0.75)' : 'rgba(245, 158, 11, 0.75)';

    // Helper to get canvas coords
    const getX = (pt: { x: number }) => pt.x * width;
    const getY = (pt: { y: number }) => pt.y * height;

    // Draw bones
    const bones = [
      [keypoints.leftShoulder, keypoints.rightShoulder],
      [keypoints.leftShoulder, keypoints.leftElbow],
      [keypoints.leftElbow, keypoints.leftWrist],
      [keypoints.rightShoulder, keypoints.rightElbow],
      [keypoints.rightElbow, keypoints.rightWrist],
      [keypoints.leftShoulder, keypoints.leftHip],
      [keypoints.rightShoulder, keypoints.rightHip],
      [keypoints.leftHip, keypoints.rightHip],
      [keypoints.leftHip, keypoints.leftKnee],
      [keypoints.leftKnee, keypoints.leftAnkle],
      [keypoints.rightHip, keypoints.rightKnee],
      [keypoints.rightKnee, keypoints.rightAnkle],
    ];

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 12;
    ctx.shadowColor = jointColor;

    for (const [p1, p2] of bones) {
      ctx.strokeStyle = boneColor;
      ctx.beginPath();
      ctx.moveTo(getX(p1), getY(p1));
      ctx.lineTo(getX(p2), getY(p2));
      ctx.stroke();
    }

    // Draw Joints
    const joints = Object.values(keypoints);
    for (const joint of joints) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 14;
      ctx.shadowColor = jointColor;
      ctx.beginPath();
      ctx.arc(getX(joint), getY(joint), 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = jointColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(getX(joint), getY(joint), 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Joint Angle Arc on the relevant joint!
    let targetJoint = keypoints.leftKnee;
    if (currentExercise === 'bicep_curls') targetJoint = keypoints.leftElbow;
    if (currentExercise === 'shoulder_press') targetJoint = keypoints.leftShoulder;

    const jx = getX(targetJoint);
    const jy = getY(targetJoint);

    // Angle circle badge
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(6, 11, 25, 0.85)';
    ctx.beginPath();
    ctx.arc(jx + 45, jy, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = jointColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(jx + 45, jy, 26, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${analysis.currentAngle}°`, jx + 45, jy);

  }, [currentExercise, isCompleted, manualDepth, simulationMode, targetReps, voiceCoachEnabled]);

  // RequestAnimationFrame loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  // Handle Resize of canvas to match container
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFinishSession = () => {
    const durationSeconds = Math.max(15, Math.round((Date.now() - sessionStartTime) / 1000));
    const stats: WorkoutSessionStats = {
      id: `session-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      exercise: currentExercise,
      mode: 'ar',
      repsCompleted: reps,
      targetReps,
      accuracyScore: accuracy,
      durationSeconds,
      caloriesBurned: Math.round(reps * 3.4 + durationSeconds * 0.12),
      formNotes: feedbackLog.length > 0 ? feedbackLog : ['Consistent depth', 'Solid postural balance'],
    };

    onSaveSession(stats);
    playSound('success');
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 bg-white text-slate-900 editorial-grid min-h-[calc(100vh-4rem)]">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('hub')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-black tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT TO HUB</span>
          </button>

          {/* Exercise Selector */}
          <div className="flex items-center gap-1">
            {(['squats', 'bicep_curls', 'shoulder_press', 'warrior_pose'] as const).map(ex => (
              <button
                key={ex}
                onClick={() => setCurrentExercise(ex)}
                className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wider transition-all ${
                  currentExercise === ex
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ex.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation Mode Toggle */}
          <button
            onClick={() => {
              setSimulationMode(!simulationMode);
              playSound('click');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-black tracking-wider border transition-colors ${
              simulationMode 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle manual depth slider for test demo"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{simulationMode ? 'Manual Depth' : 'Auto Motion'}</span>
          </button>

          {/* Camera toggle */}
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black tracking-wider border transition-colors ${
              cameraActive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-900'
            }`}
          >
            {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{cameraActive ? 'Cam Live' : 'Cam Off'}</span>
          </button>

          {/* Twin PiP Toggle */}
          <button
            onClick={() => setShowTwinPip(!showTwinPip)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black tracking-wider border transition-colors ${
              showTwinPip
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Twin Mirror</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AR Live Viewport */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[4/3] sm:aspect-[16/10] shadow-md flex items-center justify-center">
          {/* Background Video Stream */}
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            /* Backdrop when camera is off */
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
              <div className="text-center space-y-3 p-6 max-w-md z-10">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-white">
                  Kinematic Posture Tracking Active
                </h4>
                <p className="text-xs text-slate-400">
                  {cameraError || 'Connect your webcam for real-time video overlay, or use the interactive motion simulator below.'}
                </p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white border border-slate-700 hover:bg-indigo-600 font-black text-xs tracking-wider shadow-sm transition-colors"
                >
                  Enable Webcam Feed
                </button>
              </div>
            </div>
          )}

          {/* Skeleton Overlay Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* HUD Corner Reticles */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-400 pointer-events-none z-20" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-400 pointer-events-none z-20" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-400 pointer-events-none z-20" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-400 pointer-events-none z-20" />

          {/* Top Floating Telemetry Overlay */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-slate-700 text-xs font-black text-white backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AR HUD // 60 FPS</span>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-black/80 border border-slate-700 text-xs font-black text-indigo-300 backdrop-blur-md">
              <span>STAGE: </span>
              <span className="font-bold text-white uppercase">{repStage}</span>
            </div>
          </div>

          {/* Live Coaching Banner */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-black/85 border border-slate-700 backdrop-blur-md">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className={`p-2 rounded-lg ${accuracy >= 90 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {accuracy >= 90 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Coach Feedback</div>
                <div className="text-sm font-bold text-white">{feedback}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-code">
              <div>
                <span className="text-slate-400">Angle: </span>
                <span className="text-white font-bold">{jointAngle}°</span>
              </div>
              <div>
                <span className="text-slate-400">Accuracy: </span>
                <span className="text-emerald-400 font-bold">{accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Picture-in-Picture 3D Digital Twin Mirror */}
          {showTwinPip && (
            <div className="absolute top-14 right-4 w-40 sm:w-48 h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-700 bg-black/90 shadow-2xl z-20 backdrop-blur-md">
              <div className="px-2.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] font-black uppercase text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span>TWIN MIRROR</span>
                </span>
                <span className="text-indigo-400 font-mono-code">LIVE</span>
              </div>
              <div className="w-full h-[calc(100%-30px)]">
                <DigitalTwinCanvas
                  avatarConfig={avatarConfig}
                  exercise={currentExercise}
                  poseKeypoints={currentKeypointsRef.current}
                  mirrorUser={true}
                  interactive={false}
                  showPedestal={false}
                  zoom={1.3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Dashboard & Rep Metrics Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reps Completed Big Counter */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">WORKOUT PROGRESS</span>
              <span className="text-indigo-600 font-black">{currentExercise.toUpperCase()}</span>
            </div>

            <div className="py-2">
              <div className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-900">
                {reps}
                <span className="text-2xl font-bold text-slate-400">/{targetReps}</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-2">
                REPS COMPLETED
              </div>
            </div>

            {/* Target progress gauge */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${Math.min(100, (reps / targetReps) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-bold pt-1">
              <span className="text-slate-500">Form Accuracy:</span>
              <span className="text-emerald-600 font-black">{accuracy}%</span>
            </div>
          </div>

          {/* Test Depth Slider (Judges / Simulator Mode) */}
          {simulationMode && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-900 uppercase text-[10px] tracking-wider">MANUAL KINEMATIC DEPTH</span>
                <span className="text-slate-900 font-black">{Math.round(manualDepth * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={manualDepth}
                onChange={(e) => setManualDepth(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-indigo-700 font-medium leading-snug">
                Slide up/down to simulate knee flexion & verify rep counting state machine.
              </p>
            </div>
          )}

          {/* Live Audio Coach Feedback Log */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">RECENT FORM CUES</span>
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
            </div>

            <div className="space-y-2 text-xs">
              {feedbackLog.length > 0 ? (
                feedbackLog.map((cue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700 font-medium">
                    <span className="text-indigo-600 text-[10px] mt-0.5 font-mono-code font-bold">[{idx + 1}]</span>
                    <span className="leading-snug">{cue}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs italic py-2">
                  Complete reps to register automated biomechanical cues.
                </div>
              )}
            </div>
          </div>

          {/* Session Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                trackerRef.current.resetCount();
                setReps(0);
                setIsCompleted(false);
                playSound('click');
              }}
              className="p-3.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-900 transition-colors shadow-sm"
              title="Reset Rep Counter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="btn-finish-ar-session"
              onClick={handleFinishSession}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-widest hover:bg-indigo-600 shadow-sm transition-all"
            >
              <span>FINISH & LOG METRICS</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
