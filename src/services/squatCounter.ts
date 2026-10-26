import { PoseLandmark, MovementPhase, TrackingQuality, RepCounterState, SquatFeedback } from '../types';
import { soundService } from './audio';

/**
 * HiperMove AI — Real Squat Repetition Counter & State Machine
 * 
 * MediaPipe Pose Landmark Indices:
 * Left side:
 *  - 23: Left Hip
 *  - 25: Left Knee
 *  - 27: Left Ankle
 * Right side:
 *  - 24: Right Hip
 *  - 26: Right Knee
 *  - 28: Right Ankle
 * 
 * Kinematic Thresholds:
 * - STANDING_THRESHOLD: >= 155° (legs straight / upright lock)
 * - DESCENDING_THRESHOLD: < 140° (initiation of knee flexion)
 * - BOTTOM_DEPTH_THRESHOLD: <= 102° (proper squat depth)
 * - ASCENDING_THRESHOLD: > 115° (extension return phase)
 * - MIN_REP_INTERVAL_MS: 1000ms (prevents double-counting from momentary jitter)
 */

export const SQUAT_THRESHOLDS = {
  STANDING: 155,
  DESCENDING: 140,
  BOTTOM_DEPTH: 102,
  ASCENDING: 115,
  VISIBILITY_MIN: 0.45,
  MIN_REP_INTERVAL_MS: 1000,
  SMOOTHING_FACTOR: 0.35 // Exponential Moving Average alpha
};

export function calculateJointAngle(
  pointA: PoseLandmark,
  pointB: PoseLandmark,
  pointC: PoseLandmark
): number {
  // Vector BA
  const vBAx = pointA.x - pointB.x;
  const vBAy = pointA.y - pointB.y;

  // Vector BC
  const vBCx = pointC.x - pointB.x;
  const vBCy = pointC.y - pointB.y;

  const dotProduct = vBAx * vBCx + vBAy * vBCy;
  const magBA = Math.sqrt(vBAx * vBAx + vBAy * vBAy);
  const magBC = Math.sqrt(vBCx * vBCx + vBCy * vBCy);

  if (magBA * magBC === 0) return 180;

  const cosine = Math.max(-1, Math.min(1, dotProduct / (magBA * magBC)));
  const angleRad = Math.acos(cosine);
  return (angleRad * 180) / Math.PI;
}

export class SquatCounter {
  private count: number = 0;
  private phase: MovementPhase = 'idle';
  private reachedBottom: boolean = false;
  private smoothedAngle: number | null = null;
  private minAngleInCurrentRep: number = 180;
  private minAngleSession: number = 180;
  private lastRepTimestamp: number = 0;
  private repTimestamps: number[] = [];
  private consecutiveLostFrames: number = 0;
  private onRepCompleted?: (count: number, minKneeAngle: number) => void;

  constructor(options?: { onRepCompleted?: (count: number, minKneeAngle: number) => void }) {
    this.onRepCompleted = options?.onRepCompleted;
  }

  public reset() {
    this.count = 0;
    this.phase = 'idle';
    this.reachedBottom = false;
    this.smoothedAngle = null;
    this.minAngleInCurrentRep = 180;
    this.minAngleSession = 180;
    this.lastRepTimestamp = 0;
    this.repTimestamps = [];
    this.consecutiveLostFrames = 0;
  }

  public processPose(landmarks: PoseLandmark[] | null | undefined): RepCounterState {
    const now = performance.now();

    // 1. Handle no landmarks detected
    if (!landmarks || landmarks.length < 29) {
      this.consecutiveLostFrames++;
      const isLost = this.consecutiveLostFrames > 5;
      return {
        count: this.count,
        phase: this.phase === 'rep_completed' ? 'standing' : this.phase,
        currentKneeAngle: null,
        minKneeAngleSession: this.minAngleSession === 180 ? 0 : Math.round(this.minAngleSession),
        trackingQuality: isLost ? 'lost' : 'intermittent',
        isLowerBodyVisible: false,
        feedback: {
          phase: this.phase,
          message: isLost ? 'Pose tracking lost. Stand in clear view of the camera.' : 'Tracking body position...',
          type: isLost ? 'warning' : 'info'
        },
        repTimestamps: this.repTimestamps
      };
    }

    this.consecutiveLostFrames = 0;

    // 2. Check lower body landmark visibility
    // Left side: 23 (hip), 25 (knee), 27 (ankle)
    // Right side: 24 (hip), 26 (knee), 28 (ankle)
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    const isLeftVisible = 
      (leftHip.visibility ?? 1) >= SQUAT_THRESHOLDS.VISIBILITY_MIN &&
      (leftKnee.visibility ?? 1) >= SQUAT_THRESHOLDS.VISIBILITY_MIN &&
      (leftAnkle.visibility ?? 1) >= SQUAT_THRESHOLDS.VISIBILITY_MIN;

    const isRightVisible = 
      (rightHip.visibility ?? 1) >= SQUAT_THRESHOLDS.VISIBILITY_MIN &&
      (rightKnee.visibility ?? 1) >= SQUAT_THRESHOLDS.VISIBILITY_MIN &&
      (rightAnkle.visibility ?? 1) >= SQUAT_THRESHOLDS.VISIBILITY_MIN;

    if (!isLeftVisible && !isRightVisible) {
      return {
        count: this.count,
        phase: this.phase,
        currentKneeAngle: null,
        minKneeAngleSession: this.minAngleSession === 180 ? 0 : Math.round(this.minAngleSession),
        trackingQuality: 'intermittent',
        isLowerBodyVisible: false,
        feedback: {
          phase: this.phase,
          message: 'Lower body is not fully visible. Please step back so your hips, knees, and feet are in frame.',
          type: 'warning'
        },
        repTimestamps: this.repTimestamps
      };
    }

    // 3. Calculate knee angles
    let rawAngle: number;
    if (isLeftVisible && isRightVisible) {
      const leftAngle = calculateJointAngle(leftHip, leftKnee, leftAnkle);
      const rightAngle = calculateJointAngle(rightHip, rightKnee, rightAnkle);
      // Average both sides for balance
      rawAngle = (leftAngle + rightAngle) / 2;
    } else if (isLeftVisible) {
      rawAngle = calculateJointAngle(leftHip, leftKnee, leftAnkle);
    } else {
      rawAngle = calculateJointAngle(rightHip, rightKnee, rightAnkle);
    }

    // 4. Smooth angle using Exponential Moving Average
    if (this.smoothedAngle === null) {
      this.smoothedAngle = rawAngle;
    } else {
      this.smoothedAngle = 
        SQUAT_THRESHOLDS.SMOOTHING_FACTOR * rawAngle + 
        (1 - SQUAT_THRESHOLDS.SMOOTHING_FACTOR) * this.smoothedAngle;
    }

    const currentAngle = Math.round(this.smoothedAngle);

    // Keep track of deepest angle reached
    if (currentAngle < this.minAngleInCurrentRep) {
      this.minAngleInCurrentRep = currentAngle;
    }
    if (currentAngle < this.minAngleSession) {
      this.minAngleSession = currentAngle;
    }

    // 5. State Machine Transition
    let nextPhase: MovementPhase = this.phase;
    let feedback: SquatFeedback = {
      phase: this.phase,
      message: 'Pose detected. Move slowly so tracking can follow you.',
      type: 'info'
    };

    if (this.phase === 'idle' || this.phase === 'rep_completed') {
      if (currentAngle >= SQUAT_THRESHOLDS.STANDING) {
        nextPhase = 'standing';
        feedback = {
          phase: 'standing',
          message: 'Standing upright. Ready to begin your squat.',
          type: 'info'
        };
      }
    } else if (this.phase === 'standing') {
      if (currentAngle < SQUAT_THRESHOLDS.DESCENDING) {
        nextPhase = 'descending';
        this.reachedBottom = false;
        this.minAngleInCurrentRep = currentAngle;
        feedback = {
          phase: 'descending',
          message: 'Descending. Keep chest up and hips moving back.',
          type: 'info'
        };
      } else {
        feedback = {
          phase: 'standing',
          message: 'Standing upright. Ready to squat.',
          type: 'info'
        };
      }
    } else if (this.phase === 'descending') {
      if (currentAngle <= SQUAT_THRESHOLDS.BOTTOM_DEPTH) {
        nextPhase = 'bottom';
        this.reachedBottom = true;
        soundService.playDepthReached();
        feedback = {
          phase: 'bottom',
          message: 'Great depth reached! Now power back up to standing.',
          type: 'success'
        };
      } else if (currentAngle >= SQUAT_THRESHOLDS.STANDING) {
        // Aborted descent without reaching bottom
        nextPhase = 'standing';
        feedback = {
          phase: 'standing',
          message: 'Descent was shallow. Aim to lower thighs parallel to ground for a full rep.',
          type: 'info'
        };
      } else {
        feedback = {
          phase: 'descending',
          message: `Lowering (${currentAngle}°)... lower down to ~${SQUAT_THRESHOLDS.BOTTOM_DEPTH}°.`,
          type: 'info'
        };
      }
    } else if (this.phase === 'bottom') {
      if (currentAngle > SQUAT_THRESHOLDS.ASCENDING) {
        nextPhase = 'ascending';
        feedback = {
          phase: 'ascending',
          message: 'Ascending. Drive through your feet toward standing.',
          type: 'info'
        };
      } else {
        feedback = {
          phase: 'bottom',
          message: 'Holding bottom position. Drive upwards.',
          type: 'success'
        };
      }
    } else if (this.phase === 'ascending') {
      if (currentAngle >= SQUAT_THRESHOLDS.STANDING && this.reachedBottom) {
        // Repetition completed! Verify debounce interval
        const timeSinceLastRep = now - this.lastRepTimestamp;
        if (timeSinceLastRep >= SQUAT_THRESHOLDS.MIN_REP_INTERVAL_MS) {
          this.count++;
          this.lastRepTimestamp = now;
          this.repTimestamps.push(now);
          nextPhase = 'rep_completed';
          soundService.playRepCompleted();

          if (this.onRepCompleted) {
            this.onRepCompleted(this.count, this.minAngleInCurrentRep);
          }

          feedback = {
            phase: 'rep_completed',
            message: `Rep ${this.count} counted! Full depth and lockout achieved!`,
            type: 'success'
          };
          this.reachedBottom = false;
          this.minAngleInCurrentRep = 180;
        } else {
          nextPhase = 'standing';
        }
      } else if (currentAngle <= SQUAT_THRESHOLDS.BOTTOM_DEPTH) {
        // User dipped back down
        nextPhase = 'bottom';
      } else {
        feedback = {
          phase: 'ascending',
          message: 'Finishing ascent. Lock out hips and stand tall.',
          type: 'info'
        };
      }
    }

    this.phase = nextPhase;

    // Tracking quality determination
    const trackingQuality: TrackingQuality = (isLeftVisible && isRightVisible) ? 'optimal' : 'good';

    return {
      count: this.count,
      phase: this.phase,
      currentKneeAngle: currentAngle,
      minKneeAngleSession: this.minAngleSession === 180 ? 0 : Math.round(this.minAngleSession),
      trackingQuality,
      isLowerBodyVisible: true,
      feedback,
      repTimestamps: this.repTimestamps
    };
  }

  public getCount(): number {
    return this.count;
  }

  public getPhase(): MovementPhase {
    return this.phase;
  }

  public getMinAngleSession(): number {
    return this.minAngleSession === 180 ? 0 : Math.round(this.minAngleSession);
  }
}
