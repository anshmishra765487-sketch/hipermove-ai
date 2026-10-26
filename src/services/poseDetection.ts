import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { PoseLandmark } from '../types';

export const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  // Left arm
  [11, 13],
  [13, 15],
  // Right arm
  [12, 14],
  [14, 16],
  // Left leg
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [27, 31],
  // Right leg
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  [28, 32],
  // Head / face
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10]
];

export interface PoseDetectorService {
  initialize: (onProgress?: (msg: string) => void) => Promise<void>;
  detectFrame: (video: HTMLVideoElement, timestampMs: number) => PoseLandmark[] | null;
  drawSkeleton: (
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    canvasWidth: number,
    canvasHeight: number,
    mirrored: boolean,
    highlightLegs?: boolean
  ) => void;
  dispose: () => void;
  isReady: () => boolean;
}

class MediaPipePoseDetector implements PoseDetectorService {
  private landmarker: PoseLandmarker | null = null;
  private initializing: boolean = false;
  private initialized: boolean = false;
  private lastProcessedTimestamp: number = -1;

  public isReady(): boolean {
    return this.initialized && this.landmarker !== null;
  }

  public async initialize(onProgress?: (msg: string) => void): Promise<void> {
    if (this.initialized && this.landmarker) return;
    if (this.initializing) {
      // wait until current initialization finishes
      while (this.initializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      return;
    }

    this.initializing = true;
    try {
      if (onProgress) onProgress('Loading vision processing modules...');
      
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
      );

      if (onProgress) onProgress('Loading AI Pose Landmarker model...');

      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.initialized = true;
      if (onProgress) onProgress('AI Pose tracking ready.');
    } catch (error) {
      console.error('Failed to initialize MediaPipe Pose Landmarker:', error);
      // Try fallback to CPU delegate if GPU delegate fails
      try {
        if (onProgress) onProgress('Retrying model initialization with CPU delegate...');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
        );
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.45,
          minPosePresenceConfidence: 0.45,
          minTrackingConfidence: 0.45
        });
        this.initialized = true;
        if (onProgress) onProgress('AI Pose tracking ready (CPU mode).');
      } catch (fallbackErr) {
        this.initialized = false;
        this.landmarker = null;
        throw new Error('Could not load MediaPipe Pose model. Please check network connection.');
      }
    } finally {
      this.initializing = false;
    }
  }

  public detectFrame(video: HTMLVideoElement, timestampMs: number): PoseLandmark[] | null {
    if (!this.landmarker || !this.initialized) return null;
    if (video.readyState < 2) return null;

    // MediaPipe VIDEO mode requires strictly monotonically increasing timestamps
    let validTimestamp = timestampMs;
    if (validTimestamp <= this.lastProcessedTimestamp) {
      validTimestamp = this.lastProcessedTimestamp + 1;
    }
    this.lastProcessedTimestamp = validTimestamp;

    try {
      const results = this.landmarker.detectForVideo(video, validTimestamp);
      if (results.landmarks && results.landmarks.length > 0) {
        return results.landmarks[0] as PoseLandmark[];
      }
      return null;
    } catch (err) {
      console.warn('Pose detection frame error:', err);
      return null;
    }
  }

  public drawSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    canvasWidth: number,
    canvasHeight: number,
    mirrored: boolean,
    highlightLegs: boolean = true
  ): void {
    if (!landmarks || landmarks.length === 0) return;

    ctx.save();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Coordinate conversion helper (accounting for camera mirroring)
    const getCoordinates = (landmark: PoseLandmark) => {
      const normX = mirrored ? 1 - landmark.x : landmark.x;
      return {
        x: normX * canvasWidth,
        y: landmark.y * canvasHeight,
        vis: landmark.visibility ?? 1
      };
    };

    // Draw Skeleton Connections
    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const startPt = landmarks[startIdx];
      const endPt = landmarks[endIdx];

      if (!startPt || !endPt) continue;

      const p1 = getCoordinates(startPt);
      const p2 = getCoordinates(endPt);

      // Require both joints to have adequate visibility
      if (p1.vis < 0.35 || p2.vis < 0.35) continue;

      const isLegBone = (startIdx >= 23 && endIdx >= 23);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (isLegBone && highlightLegs) {
        // High-visibility Lime-green highlight for squatting lower body
        ctx.strokeStyle = 'rgba(132, 204, 22, 0.9)';
        ctx.lineWidth = 5;
        ctx.shadowColor = 'rgba(132, 204, 22, 0.6)';
        ctx.shadowBlur = 10;
      } else {
        // High-tech Cyan for torso and upper body
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        ctx.shadowBlur = 6;
      }

      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Draw Joint Landmark Nodes
    landmarks.forEach((landmark, idx) => {
      const p = getCoordinates(landmark);
      if (p.vis < 0.35) return;

      const isSquatKeyJoint = [23, 24, 25, 26, 27, 28].includes(idx); // Hips, knees, ankles

      ctx.beginPath();
      const radius = isSquatKeyJoint ? 7 : 4;
      ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);

      if (isSquatKeyJoint) {
        ctx.fillStyle = '#a3e635'; // Lime green
        ctx.shadowColor = '#84cc16';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#22d3ee'; // Cyan
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
      }

      ctx.fill();

      // Outer white ring for clarity
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });

    ctx.restore();
  }

  public dispose(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch (e) {
        console.warn('Error closing pose detector:', e);
      }
      this.landmarker = null;
    }
    this.initialized = false;
    this.initializing = false;
    this.lastProcessedTimestamp = -1;
  }
}

export const poseDetector = new MediaPipePoseDetector();
