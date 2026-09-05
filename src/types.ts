export type AppView = 
  | 'landing' 
  | 'setup' 
  | 'hub' 
  | 'ar' 
  | 'vr' 
  | 'mr' 
  | 'dashboard' 
  | 'settings';

export type ExerciseType = 'squats' | 'bicep_curls' | 'shoulder_press' | 'warrior_pose';

export interface ExerciseInfo {
  id: ExerciseType;
  name: string;
  targetMuscles: string[];
  description: string;
  targetReps: number;
  primaryJoint: string;
  idealAngleRange: [number, number]; // e.g. [70, 160]
}

export interface AvatarConfig {
  name: string;
  colorTheme: 'cyan' | 'violet' | 'emerald' | 'amber';
  renderStyle: 'wireframe' | 'cyber_mesh' | 'hologram_core';
  heightCm: number;
  wingspanCm: number;
  glowIntensity: number;
  scanDate?: string;
  syncLevel: number;
}

export interface PoseLandmark {
  x: number; // 0 to 1
  y: number; // 0 to 1
  z?: number;
  confidence: number;
}

export interface PoseKeypoints {
  nose: PoseLandmark;
  leftShoulder: PoseLandmark;
  rightShoulder: PoseLandmark;
  leftElbow: PoseLandmark;
  rightElbow: PoseLandmark;
  leftWrist: PoseLandmark;
  rightWrist: PoseLandmark;
  leftHip: PoseLandmark;
  rightHip: PoseLandmark;
  leftKnee: PoseLandmark;
  rightKnee: PoseLandmark;
  leftAnkle: PoseLandmark;
  rightAnkle: PoseLandmark;
}

export interface WorkoutSessionStats {
  id: string;
  date: string;
  exercise: ExerciseType;
  mode: 'ar' | 'vr' | 'mr';
  repsCompleted: number;
  targetReps: number;
  accuracyScore: number;
  durationSeconds: number;
  caloriesBurned: number;
  formNotes: string[];
}

export interface DeviceXRStatus {
  webxrSupported: boolean;
  vrSupported: boolean;
  arSupported: boolean;
  cameraAvailable: boolean;
  motionSupported: boolean;
}
