import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Glasses, 
  ArrowLeft, 
  RotateCcw, 
  Camera, 
  Play, 
  Pause, 
  CheckCircle2, 
  Info, 
  ChevronRight,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { AppView, AvatarConfig, ExerciseType, DeviceXRStatus, WorkoutSessionStats } from '../types';
import { playSound, speakCue } from '../utils/audio';

interface VRViewProps {
  onNavigate: (view: AppView) => void;
  avatarConfig: AvatarConfig;
  exercise: ExerciseType;
  targetReps: number;
  xrStatus: DeviceXRStatus;
  voiceCoachEnabled: boolean;
  onSaveSession: (session: WorkoutSessionStats) => void;
}

export const VRView: React.FC<VRViewProps> = ({
  onNavigate,
  avatarConfig,
  exercise,
  targetReps,
  xrStatus,
  voiceCoachEnabled,
  onSaveSession,
}) => {
  const [currentExercise, setCurrentExercise] = useState<ExerciseType>(exercise);
  const [isPlaying, setIsPlaying] = useState(true);
  const [pacingSpeed, setPacingSpeed] = useState<number>(1.0);
  const [cameraAngle, setCameraAngle] = useState<'trainer' | 'isometric' | 'first_person'>('trainer');
  const [vrSessionActive, setVrSessionActive] = useState(false);
  const [vrMessage, setVrMessage] = useState<string | null>(null);
  const [completedReps, setCompletedReps] = useState(4);
  const [startTime] = useState(Date.now());

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const avatarLimbsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const xrSessionRef = useRef<XRSession | null>(null);

  // Initialize Full 3D Virtual Gym Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050711);
    scene.fog = new THREE.FogExp2(0x050711, 0.08);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 3.8);
    cameraRef.current = camera;

    // Renderer with WebXR Support
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    if ('xr' in renderer) {
      renderer.xr.enabled = true;
    }
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 3, 15);
    cyanPointLight.position.set(0, 3, 2);
    scene.add(cyanPointLight);

    const violetPointLight = new THREE.PointLight(0xa855f7, 2, 12);
    violetPointLight.position.set(-2, 2, -2);
    scene.add(violetPointLight);

    // Virtual Gym Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.3,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Neon Cyber Grid overlay on floor
    const gridHelper = new THREE.GridHelper(24, 24, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Gym Workout Stage Platform
    const stageGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.12, 32);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = 0.06;
    scene.add(stage);

    const ringLight = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 2.1, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })
    );
    ringLight.rotation.x = Math.PI / 2;
    ringLight.position.y = 0.125;
    scene.add(ringLight);

    // 3D Gym Props: Dumbbell Racks
    const rackGroup = new THREE.Group();
    const rackGeo = new THREE.BoxGeometry(1.8, 0.8, 0.4);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(-2.5, 0.4, -1);
    rack.rotation.y = Math.PI / 6;
    rackGroup.add(rack);

    // Dumbbell models on rack
    for (let i = -0.6; i <= 0.6; i += 0.4) {
      const dbGroup = new THREE.Group();
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      bar.rotation.z = Math.PI / 2;
      const plate1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }));
      plate1.rotation.z = Math.PI / 2;
      plate1.position.x = -0.09;
      const plate2 = plate1.clone();
      plate2.position.x = 0.09;
      dbGroup.add(bar, plate1, plate2);
      dbGroup.position.set(-2.5 + i * 0.3, 0.85, -1 - i * 0.15);
      rackGroup.add(dbGroup);
    }
    scene.add(rackGroup);

    // Holographic Gym Pillars
    for (const [px, pz] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) {
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 5, 12);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.2,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, 2.5, pz);
      scene.add(pillar);
    }

    // Build Rigged Hologram Trainer Avatar
    const avatarGroup = new THREE.Group();
    avatarGroup.position.set(0, 0.12, 0);

    const themeColor = avatarConfig.colorTheme === 'violet' ? 0xa855f7 : 0x06b6d4;
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: themeColor,
      roughness: 0.1,
      metalness: 0.9,
      emissive: themeColor,
      emissiveIntensity: 0.3,
    });

    const joints: { [key: string]: THREE.Object3D } = {};

    // Pelvis
    const pelvis = new THREE.Group();
    pelvis.position.set(0, 1.0, 0);
    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.15, 8), mainMaterial);
    pelvis.add(pelvisMesh);
    avatarGroup.add(pelvis);
    joints.pelvis = pelvis;

    // Spine & Chest
    const spine = new THREE.Group();
    spine.position.set(0, 0.1, 0);
    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.22), mainMaterial);
    chestMesh.position.y = 0.22;
    spine.add(chestMesh);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 0.44, 0);
    const headMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 1), mainMaterial);
    head.add(headMesh);
    spine.add(head);
    joints.head = head;
    pelvis.add(spine);
    joints.spine = spine;

    // Limbs
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(0.26, 0.34, 0);
    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.24, 8), mainMaterial);
    leftUpperArm.position.y = -0.12;
    leftShoulder.add(leftUpperArm);
    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.24, 0);
    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.24, 8), mainMaterial);
    leftForearm.position.y = -0.12;
    leftElbow.add(leftForearm);
    leftShoulder.add(leftElbow);
    spine.add(leftShoulder);
    joints.leftShoulder = leftShoulder;
    joints.leftElbow = leftElbow;

    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(-0.26, 0.34, 0);
    const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.24, 8), mainMaterial);
    rightUpperArm.position.y = -0.12;
    rightShoulder.add(rightUpperArm);
    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.24, 0);
    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.24, 8), mainMaterial);
    rightForearm.position.y = -0.12;
    rightElbow.add(rightForearm);
    rightShoulder.add(rightElbow);
    spine.add(rightShoulder);
    joints.rightShoulder = rightShoulder;
    joints.rightElbow = rightElbow;

    // Legs
    const leftHip = new THREE.Group();
    leftHip.position.set(0.12, -0.08, 0);
    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.4, 8), mainMaterial);
    leftThigh.position.y = -0.2;
    leftHip.add(leftThigh);
    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -0.4, 0);
    const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.42, 8), mainMaterial);
    leftShin.position.y = -0.21;
    leftKnee.add(leftShin);
    leftHip.add(leftKnee);
    pelvis.add(leftHip);
    joints.leftHip = leftHip;
    joints.leftKnee = leftKnee;

    const rightHip = new THREE.Group();
    rightHip.position.set(-0.12, -0.08, 0);
    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.4, 8), mainMaterial);
    rightThigh.position.y = -0.2;
    rightHip.add(rightThigh);
    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -0.4, 0);
    const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.42, 8), mainMaterial);
    rightShin.position.y = -0.21;
    rightKnee.add(rightShin);
    rightHip.add(rightKnee);
    pelvis.add(rightHip);
    joints.rightHip = rightHip;
    joints.rightKnee = rightKnee;

    scene.add(avatarGroup);
    avatarLimbsRef.current = joints;

    // Mouse drag rotation
    let isDragging = false;
    let prevX = 0;
    let rotY = 0;
    const onDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevX) * 0.008;
      prevX = e.clientX;
      avatarGroup.rotation.y = rotY;
    };
    const onUp = () => { isDragging = false; };
    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime() * pacingSpeed;

      // Animate Trainer Avatar
      if (joints.pelvis && joints.spine) {
        if (currentExercise === 'squats') {
          const p = Math.sin(time * 2) * 0.5 + 0.5;
          joints.pelvis.position.y = 1.0 - p * 0.35;
          joints.spine.rotation.x = p * 0.35;
          joints.leftHip.rotation.x = -p * 1.35;
          joints.rightHip.rotation.x = -p * 1.35;
          joints.leftKnee.rotation.x = p * 1.9;
          joints.rightKnee.rotation.x = p * 1.9;
          joints.leftShoulder.rotation.x = -p * 1.2;
          joints.rightShoulder.rotation.x = -p * 1.2;
        } else if (currentExercise === 'bicep_curls') {
          const p = Math.sin(time * 2.5) * 0.5 + 0.5;
          joints.leftElbow.rotation.x = p * 2.2;
          joints.rightElbow.rotation.x = p * 2.2;
          joints.pelvis.position.y = 1.0;
        } else if (currentExercise === 'shoulder_press') {
          const p = Math.sin(time * 2) * 0.5 + 0.5;
          joints.leftShoulder.rotation.z = Math.PI / 2 - (1 - p) * 0.4;
          joints.rightShoulder.rotation.z = -(Math.PI / 2 - (1 - p) * 0.4);
          joints.leftElbow.rotation.z = (1 - p) * 1.4;
          joints.rightElbow.rotation.z = -(1 - p) * 1.4;
        } else {
          joints.pelvis.position.y = 0.88;
          joints.leftHip.rotation.x = -0.8;
          joints.leftKnee.rotation.x = 1.5;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = nw / nh;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [avatarConfig.colorTheme, currentExercise, pacingSpeed]);

  // Adjust camera presets
  useEffect(() => {
    if (!cameraRef.current) return;
    if (cameraAngle === 'trainer') {
      cameraRef.current.position.set(0, 1.6, 3.8);
      cameraRef.current.lookAt(0, 1.2, 0);
    } else if (cameraAngle === 'isometric') {
      cameraRef.current.position.set(2.8, 2.5, 3.2);
      cameraRef.current.lookAt(0, 1.0, 0);
    } else if (cameraAngle === 'first_person') {
      cameraRef.current.position.set(0, 1.5, 1.2);
      cameraRef.current.lookAt(0, 1.3, -2);
    }
  }, [cameraAngle]);

  // Handle WebXR Session Launch
  const handleToggleWebXR = async () => {
    if (vrSessionActive && xrSessionRef.current) {
      await xrSessionRef.current.end();
      setVrSessionActive(false);
      setVrMessage('VR session ended. Switched to 3D Desktop mode.');
      return;
    }

    if (!navigator.xr) {
      setVrMessage('WebXR not detected on this browser/device. Interactive 3D Canvas mode active.');
      speakCue('WebXR not detected. Enjoying 3D gym preview.');
      return;
    }

    try {
      const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!isSupported) {
        setVrMessage('Immersive VR session not supported on current display hardware. Use a Meta Quest or WebXR headset for full VR.');
        speakCue('Running in 3D desktop preview.');
        return;
      }

      const session = await navigator.xr.requestSession('immersive-vr');
      xrSessionRef.current = session;
      if (rendererRef.current) {
        rendererRef.current.xr.setSession(session);
      }
      setVrSessionActive(true);
      setVrMessage('WebXR Immersive VR Session Active!');
      speakCue('Welcome to AURA Holo-Gym VR.');
    } catch {
      setVrMessage('VR hardware connection request returned desktop fallback mode.');
    }
  };

  const handleFinish = () => {
    const duration = Math.max(20, Math.round((Date.now() - startTime) / 1000));
    onSaveSession({
      id: `session-vr-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      exercise: currentExercise,
      mode: 'vr',
      repsCompleted: completedReps,
      targetReps,
      accuracyScore: 98,
      durationSeconds: duration,
      caloriesBurned: Math.round(completedReps * 3.6 + duration * 0.14),
      formNotes: ['Full range of motion demonstrated', 'Biomechanic cadence followed'],
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

          <div className="flex items-center gap-1">
            {(['squats', 'bicep_curls', 'shoulder_press'] as const).map(ex => (
              <button
                key={ex}
                onClick={() => {
                  setCurrentExercise(ex);
                  playSound('click');
                }}
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

        {/* WebXR Enter VR Button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-enter-vr"
            onClick={handleToggleWebXR}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black tracking-wider shadow-sm transition-all ${
              vrSessionActive
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Glasses className="w-4 h-4" />
            <span>{vrSessionActive ? 'EXIT VR SESSION' : 'ENTER WEBXR VR'}</span>
          </button>
        </div>
      </div>

      {/* 3D Virtual Gym Stage Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[4/3] sm:aspect-[16/10] shadow-md">
          {/* Three.js Canvas Container */}
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating HUD Badges inside 3D Scene */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-slate-700 text-xs font-black text-indigo-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>HOLO GYM // WEBXR ENGINE</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-slate-700 text-xs font-black text-white backdrop-blur-md">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>DRAG TO ROTATE SCENE</span>
            </div>
          </div>

          {/* Camera Perspective Switcher Floating on Canvas */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/80 p-1.5 rounded-full border border-slate-700 backdrop-blur-md z-10">
            {(['trainer', 'isometric', 'first_person'] as const).map(angle => (
              <button
                key={angle}
                onClick={() => {
                  setCameraAngle(angle);
                  playSound('click');
                }}
                className={`px-3 py-1 rounded-full text-xs font-black capitalize transition-all ${
                  cameraAngle === angle
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {angle.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Pacing Speed Toggle */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/80 p-1.5 rounded-full border border-slate-700 backdrop-blur-md z-10">
            {[0.75, 1.0, 1.25].map(speed => (
              <button
                key={speed}
                onClick={() => {
                  setPacingSpeed(speed);
                  playSound('click');
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-black transition-all ${
                  pacingSpeed === speed
                    ? 'bg-white text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Info & Cadence Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">HOLOGRAPHIC TRAINER LEAD</span>
              <span className="text-indigo-600 font-black">VR IMMERSION</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {currentExercise.replace('_', ' ').toUpperCase()} CADENCE
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Follow the holographic coach’s movement tempo. Match joint flexion angles to optimize muscle hypertrophy and joint longevity.
              </p>
            </div>

            {/* Cadence Visualizer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Tempo Breakdown:</span>
                <span className="text-indigo-600 font-black">3 - 1 - 2 - 0</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold text-center">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600">3s Eccentric</div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600">1s Pause</div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600">2s Drive</div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600">0s Top</div>
              </div>
            </div>

            {/* Rep tracking in VR */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">PACED REPS</div>
                <div className="text-3xl font-black text-slate-900">
                  {completedReps} <span className="text-lg font-bold text-slate-400">/{targetReps}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setCompletedReps(r => Math.min(targetReps, r + 1));
                  playSound('rep');
                }}
                className="px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-indigo-600 text-xs font-black tracking-wider transition-all"
              >
                + LOG REP
              </button>
            </div>

            {vrMessage && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-medium flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                <span>{vrMessage}</span>
              </div>
            )}

            <button
              onClick={handleFinish}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-widest hover:bg-indigo-600 shadow-sm transition-all"
            >
              <span>COMPLETE & VIEW STATS</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
