import { PoseKeypoints, PoseLandmark, ExerciseType } from '../types';

// Calculate angle in degrees between three points: A (anchor 1), B (vertex), C (anchor 2)
export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

export interface RepAnalysis {
  currentAngle: number;
  stage: 'up' | 'down' | 'hold';
  formAccuracy: number;
  feedback: string;
  isRepComplete: boolean;
  idealMinAngle: number;
  idealMaxAngle: number;
}

export class ExerciseTracker {
  private exercise: ExerciseType;
  private stage: 'up' | 'down' | 'hold' = 'up';
  private repCount = 0;
  private currentAccuracy = 95;
  private repAngles: number[] = [];

  constructor(exercise: ExerciseType) {
    this.exercise = exercise;
  }

  public setExercise(exercise: ExerciseType) {
    this.exercise = exercise;
    this.stage = 'up';
    this.repCount = 0;
    this.currentAccuracy = 95;
    this.repAngles = [];
  }

  public getRepCount(): number {
    return this.repCount;
  }

  public resetCount() {
    this.repCount = 0;
    this.stage = 'up';
    this.currentAccuracy = 95;
  }

  public processPose(keypoints: PoseKeypoints): RepAnalysis {
    let currentAngle = 180;
    let isRepComplete = false;
    let feedback = 'Prepare for next rep';
    let idealMinAngle = 80;
    let idealMaxAngle = 165;

    if (this.exercise === 'squats') {
      idealMinAngle = 80;
      idealMaxAngle = 165;
      // Knee angle: hip -> knee -> ankle
      const leftKneeAngle = calculateAngle(keypoints.leftHip, keypoints.leftKnee, keypoints.leftAnkle);
      const rightKneeAngle = calculateAngle(keypoints.rightHip, keypoints.rightKnee, keypoints.rightAnkle);
      currentAngle = Math.round((leftKneeAngle + rightKneeAngle) / 2);

      this.repAngles.push(currentAngle);
      if (this.repAngles.length > 20) this.repAngles.shift();

      // Squat logic
      if (currentAngle > 155) {
        if (this.stage === 'down') {
          // Rep completed!
          this.stage = 'up';
          this.repCount++;
          isRepComplete = true;
          feedback = 'Excellent squat depth! Drive through heels.';
          this.currentAccuracy = Math.min(100, Math.max(70, Math.round(100 - Math.abs(currentAngle - 165) * 0.5)));
        } else {
          this.stage = 'up';
          feedback = 'Lower hips into parallel squat';
        }
      } else if (currentAngle < 95) {
        this.stage = 'down';
        if (currentAngle < 75) {
          feedback = 'Good depth, don’t bounce at the bottom';
          this.currentAccuracy = 92;
        } else {
          feedback = 'Optimal squat depth reached! Power back up';
          this.currentAccuracy = 98;
        }
      } else {
        if (this.stage === 'up') {
          feedback = 'Descending: chest proud, knees tracking over toes';
        } else {
          feedback = 'Ascending: squeeze glutes at the top';
        }
      }
    } else if (this.exercise === 'bicep_curls') {
      idealMinAngle = 45;
      idealMaxAngle = 155;
      // Elbow angle: shoulder -> elbow -> wrist
      const leftElbowAngle = calculateAngle(keypoints.leftShoulder, keypoints.leftElbow, keypoints.leftWrist);
      const rightElbowAngle = calculateAngle(keypoints.rightShoulder, keypoints.rightElbow, keypoints.rightWrist);
      currentAngle = Math.round((leftElbowAngle + rightElbowAngle) / 2);

      if (currentAngle > 140) {
        if (this.stage === 'down') {
          this.stage = 'up';
          this.repCount++;
          isRepComplete = true;
          feedback = 'Rep complete! Full extension achieved.';
          this.currentAccuracy = 96;
        } else {
          feedback = 'Curl weights upward toward shoulders';
        }
      } else if (currentAngle < 60) {
        this.stage = 'down';
        feedback = 'Peak contraction! Squeeze biceps, lower with control';
        this.currentAccuracy = 97;
      } else {
        feedback = 'Keep elbows pinned to your ribs, avoid swinging';
        this.currentAccuracy = 88;
      }
    } else if (this.exercise === 'shoulder_press') {
      idealMinAngle = 70;
      idealMaxAngle = 170;
      const leftArmAngle = calculateAngle(keypoints.leftElbow, keypoints.leftShoulder, keypoints.leftHip);
      const rightArmAngle = calculateAngle(keypoints.rightElbow, keypoints.rightShoulder, keypoints.rightHip);
      currentAngle = Math.round((leftArmAngle + rightArmAngle) / 2);

      if (currentAngle > 150) {
        if (this.stage === 'down') {
          this.stage = 'up';
          this.repCount++;
          isRepComplete = true;
          feedback = 'Full lockout! Lower smoothly to ear height.';
          this.currentAccuracy = 96;
        } else {
          feedback = 'Lower bar slowly to collarbone';
        }
      } else if (currentAngle < 85) {
        this.stage = 'down';
        feedback = 'Press straight upward overhead';
        this.currentAccuracy = 94;
      } else {
        feedback = 'Engage core, keep ribs down';
        this.currentAccuracy = 90;
      }
    } else if (this.exercise === 'warrior_pose') {
      idealMinAngle = 90;
      idealMaxAngle = 110;
      const leadKnee = calculateAngle(keypoints.leftHip, keypoints.leftKnee, keypoints.leftAnkle);
      currentAngle = leadKnee;

      const diff = Math.abs(currentAngle - 90);
      this.currentAccuracy = Math.max(70, Math.round(100 - diff * 0.8));
      if (diff < 15) {
        feedback = 'Flawless Warrior II alignment! Hold steady.';
      } else if (currentAngle > 105) {
        feedback = 'Sink deeper into the front knee (aim for 90°)';
      } else {
        feedback = 'Knee past ankle: ease back slightly to protect joint';
      }
    }

    return {
      currentAngle,
      stage: this.stage,
      formAccuracy: this.currentAccuracy,
      feedback,
      isRepComplete,
      idealMinAngle,
      idealMaxAngle,
    };
  }
}

// Procedural keypoints generator for real-time simulation / calibration fallback
export function generateProceduralKeypoints(
  timeSeconds: number, 
  exercise: ExerciseType,
  depthProgress: number = 0.5
): PoseKeypoints {
  const p = Math.sin(timeSeconds * 2) * 0.5 + 0.5; // 0 to 1 loop
  const effectiveP = depthProgress !== 0.5 ? depthProgress : p;

  if (exercise === 'squats') {
    const hipY = 0.52 + effectiveP * 0.16;
    const kneeY = 0.68 + effectiveP * 0.08;
    const kneeXSpread = 0.03 + effectiveP * 0.02;

    return {
      nose: { x: 0.5, y: 0.22 + effectiveP * 0.1, confidence: 0.99 },
      leftShoulder: { x: 0.44, y: 0.32 + effectiveP * 0.12, confidence: 0.98 },
      rightShoulder: { x: 0.56, y: 0.32 + effectiveP * 0.12, confidence: 0.98 },
      leftElbow: { x: 0.41, y: 0.42 + effectiveP * 0.12, confidence: 0.95 },
      rightElbow: { x: 0.59, y: 0.42 + effectiveP * 0.12, confidence: 0.95 },
      leftWrist: { x: 0.46, y: 0.38 + effectiveP * 0.12, confidence: 0.94 },
      rightWrist: { x: 0.54, y: 0.38 + effectiveP * 0.12, confidence: 0.94 },
      leftHip: { x: 0.45, y: hipY, confidence: 0.97 },
      rightHip: { x: 0.55, y: hipY, confidence: 0.97 },
      leftKnee: { x: 0.44 - kneeXSpread, y: kneeY, confidence: 0.96 },
      rightKnee: { x: 0.56 + kneeXSpread, y: kneeY, confidence: 0.96 },
      leftAnkle: { x: 0.43, y: 0.88, confidence: 0.98 },
      rightAnkle: { x: 0.57, y: 0.88, confidence: 0.98 },
    };
  }

  if (exercise === 'bicep_curls') {
    const curlProg = effectiveP; // 0 extended, 1 fully curled
    const wristY = 0.65 - curlProg * 0.35;
    const wristXOffset = 0.04 - curlProg * 0.03;

    return {
      nose: { x: 0.5, y: 0.2, confidence: 0.99 },
      leftShoulder: { x: 0.43, y: 0.3, confidence: 0.98 },
      rightShoulder: { x: 0.57, y: 0.3, confidence: 0.98 },
      leftElbow: { x: 0.41, y: 0.48, confidence: 0.96 },
      rightElbow: { x: 0.59, y: 0.48, confidence: 0.96 },
      leftWrist: { x: 0.41 + wristXOffset, y: wristY, confidence: 0.95 },
      rightWrist: { x: 0.59 - wristXOffset, y: wristY, confidence: 0.95 },
      leftHip: { x: 0.45, y: 0.56, confidence: 0.97 },
      rightHip: { x: 0.55, y: 0.56, confidence: 0.97 },
      leftKnee: { x: 0.45, y: 0.73, confidence: 0.96 },
      rightKnee: { x: 0.55, y: 0.73, confidence: 0.96 },
      leftAnkle: { x: 0.45, y: 0.9, confidence: 0.98 },
      rightAnkle: { x: 0.55, y: 0.9, confidence: 0.98 },
    };
  }

  if (exercise === 'shoulder_press') {
    const pressProg = effectiveP; // 0 down, 1 up
    const wristY = 0.34 - pressProg * 0.22;
    const elbowY = 0.42 - pressProg * 0.18;

    return {
      nose: { x: 0.5, y: 0.22, confidence: 0.99 },
      leftShoulder: { x: 0.43, y: 0.32, confidence: 0.98 },
      rightShoulder: { x: 0.57, y: 0.32, confidence: 0.98 },
      leftElbow: { x: 0.36, y: elbowY, confidence: 0.96 },
      rightElbow: { x: 0.64, y: elbowY, confidence: 0.96 },
      leftWrist: { x: 0.38 + pressProg * 0.08, y: wristY, confidence: 0.95 },
      rightWrist: { x: 0.62 - pressProg * 0.08, y: wristY, confidence: 0.95 },
      leftHip: { x: 0.45, y: 0.56, confidence: 0.97 },
      rightHip: { x: 0.55, y: 0.56, confidence: 0.97 },
      leftKnee: { x: 0.45, y: 0.73, confidence: 0.96 },
      rightKnee: { x: 0.55, y: 0.73, confidence: 0.96 },
      leftAnkle: { x: 0.45, y: 0.9, confidence: 0.98 },
      rightAnkle: { x: 0.55, y: 0.9, confidence: 0.98 },
    };
  }

  // Warrior II
  return {
    nose: { x: 0.48, y: 0.25, confidence: 0.99 },
    leftShoulder: { x: 0.43, y: 0.34, confidence: 0.98 },
    rightShoulder: { x: 0.57, y: 0.34, confidence: 0.98 },
    leftElbow: { x: 0.28, y: 0.34, confidence: 0.95 },
    rightElbow: { x: 0.72, y: 0.34, confidence: 0.95 },
    leftWrist: { x: 0.18, y: 0.34, confidence: 0.94 },
    rightWrist: { x: 0.82, y: 0.34, confidence: 0.94 },
    leftHip: { x: 0.44, y: 0.54, confidence: 0.97 },
    rightHip: { x: 0.56, y: 0.54, confidence: 0.97 },
    leftKnee: { x: 0.35, y: 0.66, confidence: 0.96 },
    rightKnee: { x: 0.68, y: 0.7, confidence: 0.96 },
    leftAnkle: { x: 0.35, y: 0.88, confidence: 0.98 },
    rightAnkle: { x: 0.75, y: 0.88, confidence: 0.98 },
  };
}
