export type MovementPhase = 
  | 'idle'
  | 'standing'
  | 'descending'
  | 'bottom'
  | 'ascending'
  | 'rep_completed';

export type TrackingQuality = 'optimal' | 'good' | 'intermittent' | 'lost';

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  fitnessGoal?: 'general_fitness' | 'strength' | 'fat_loss' | 'mobility';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  dailySquatsTarget?: number;
  soundEnabled?: boolean;
  showAngles?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id?: string;
  userId: string;
  exerciseType: 'squat' | 'lunge' | 'march';
  exerciseName: string;
  repsCount: number;
  durationSeconds: number;
  minKneeAngle?: number;
  avgKneeAngle?: number;
  trackingQuality: TrackingQuality;
  notes?: string;
  completedAt: string;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface SquatFeedback {
  phase: MovementPhase;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface RepCounterState {
  count: number;
  phase: MovementPhase;
  currentKneeAngle: number | null;
  minKneeAngleSession: number;
  feedback: SquatFeedback;
  trackingQuality: TrackingQuality;
  isLowerBodyVisible: boolean;
  repTimestamps: number[];
}

export interface ExerciseGuide {
  id: string;
  title: string;
  category: string;
  level: string;
  aiTracked: boolean;
  targetMuscles: string[];
  description: string;
  steps: string[];
  formCues: string[];
  modifications: string[];
  safetyNotes: string[];
}
