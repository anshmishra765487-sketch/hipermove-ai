import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { ExerciseGuide } from '../types';

interface ExerciseLibraryPageProps {
  navigate: (route: string) => void;
}

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  {
    id: 'squat',
    title: 'Bodyweight Squat',
    category: 'Lower Body Compound',
    level: 'All Levels',
    aiTracked: true,
    targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings', 'Core Stabilizers'],
    description: 'The cornerstone lower-body movement for functional leg strength, hip mobility, and core integrity. HiperMove AI provides real-time joint angle estimation and rep counting.',
    steps: [
      'Stand upright with feet shoulder-width apart, toes angled outward roughly 10° to 20°.',
      'Brace your abdomen, keep your chest proud, and fix your gaze straight ahead.',
      'Initiate the movement by sending your hips backward while simultaneously bending at the knees.',
      'Descend until your hip crease sits parallel to or slightly below your knee joint (target angle ≤102°).',
      'Drive powerfully through your mid-foot and heel to return to a full standing lockout (≥155°).'
    ],
    formCues: [
      'Maintain an upright spine; avoid rounding your lower back.',
      'Keep knees tracking in line with your second toe—do not allow knees to cave inward.',
      'Distribute weight evenly across the entire foot tripod (heel, big toe base, pinky toe base).'
    ],
    modifications: [
      'Beginner: Box/Chair Squat — squat down to tap a chair to ensure confident depth.',
      'Limited Mobility: Place small heel wedges or elevate heels on a mat to assist ankle flexion.'
    ],
    safetyNotes: [
      'Do not bounce abruptly at the bottom of the movement.',
      'If you experience sharp knee or lumbar pain, stop immediately and reduce depth.'
    ]
  },
  {
    id: 'lunge',
    title: 'Bodyweight Forward Lunge',
    category: 'Unilateral Lower Body',
    level: 'Intermediate',
    aiTracked: false,
    targetMuscles: ['Quadriceps', 'Gluteal Complex', 'Hamstrings', 'Calves'],
    description: 'A unilateral movement that challenges hip stability, balance, and single-leg strength. Excellent for evening out side-to-side leg imbalances.',
    steps: [
      'Stand tall with feet hip-width apart and hands comfortably on your hips.',
      'Take a controlled, generous step forward with one leg.',
      'Lower your hips until both your lead knee and rear knee form roughly 90° angles.',
      'Ensure your lead knee stays stacked over your ankle and does not travel far beyond your toes.',
      'Drive off the front foot to step smoothly back to the starting standing position.'
    ],
    formCues: [
      'Keep your torso perpendicular to the floor.',
      'Keep hips square and facing forward throughout the rep.',
      'Do not slam the back knee into the floor—hover it 1 inch above.'
    ],
    modifications: [
      'Beginner: Static Split Squat — keep feet planted without the dynamic forward step.',
      'Stability Assist: Place a hand lightly against a wall or sturdy table for balance.'
    ],
    safetyNotes: [
      'Avoid narrow stance width; keep feet on "train tracks" not a "tightrope".'
    ]
  },
  {
    id: 'march',
    title: 'Standing High Knees March',
    category: 'Warm-up / Hip Flexion',
    level: 'Beginner',
    aiTracked: false,
    targetMuscles: ['Hip Flexors', 'Abdominals', 'Calves'],
    description: 'A dynamic cardiovascular drill designed to lubricate hip joints, activate abdominal stabilizers, and raise core body temperature before squats.',
    steps: [
      'Stand upright with feet hip-width apart and arms relaxed at your sides.',
      'Drive your right knee upward toward hip height (90° flexion) while simultaneously driving the left arm forward.',
      'Lower the foot smoothly back to the ground under control.',
      'Alternate immediately to the left leg in a rhythmic, cadence-controlled march.'
    ],
    formCues: [
      'Maintain tall posture; do not lean backward as the knee elevates.',
      'Land softly on the ball of the foot.',
      'Engage your lower abs to pull the knee upward.'
    ],
    modifications: [
      'Gentle: Lift knees to 45° height rather than parallel.',
      'Dynamic: Transition into a running high-knees skip for cardiovascular conditioning.'
    ],
    safetyNotes: [
      'Maintain an active core to prevent hyperextending the lower back.'
    ]
  },
  {
    id: 'warmup',
    title: 'Dynamic Joint Mobility Routine',
    category: 'Warm-Up & Prep',
    level: 'All Levels',
    aiTracked: false,
    targetMuscles: ['Ankles', 'Hips', 'Thoracic Spine', 'Knees'],
    description: 'A brief 3-minute sequence consisting of ankle circles, hip openers, and world-greatest-stretch rotations to prime the kinetic chain for squat tracking.',
    steps: [
      'Ankle Rotations: 10 clockwise and 10 counter-clockwise circles per foot.',
      'Hip Circles: 10 wide rotations each direction with hands on hips.',
      'Bodyweight Good Mornings: 10 reps hinging hips back with hands behind head.',
      'Deep Squat Hold with Thoracic Reach: 30-second bottom hold breathing deeply.'
    ],
    formCues: [
      'Breathe rhythmically; do not hold your breath during mobility drills.',
      'Move through a comfortable, tension-free range of motion.'
    ],
    modifications: [
      'Support your hands on your knees if deep squat hold is uncomfortable.'
    ],
    safetyNotes: [
      'Warm-ups should feel energizing and lubricating, never strenuous or painful.'
    ]
  }
];

export const ExerciseLibraryPage: React.FC<ExerciseLibraryPageProps> = ({ navigate }) => {
  const [selectedId, setSelectedId] = useState<string>('squat');

  const selectedExercise = EXERCISE_GUIDES.find((e) => e.id === selectedId) || EXERCISE_GUIDES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Exercise & Movement Library</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Scientifically grounded technique breakdowns, joint alignment cues, and beginner modifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Exercises List (1 col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Available Movements
          </h3>
          {EXERCISE_GUIDES.map((ex) => {
            const isSelected = ex.id === selectedId;
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedId(ex.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-sm shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-white text-sm">{ex.title}</h4>
                  {ex.aiTracked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-lime-500/20 text-lime-400 border border-lime-500/30">
                      Live AI Tracked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700">
                      Guide
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{ex.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Exercise Guide (2 cols) */}
        <div className="lg:col-span-2 p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {selectedExercise.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{selectedExercise.level}</span>
              </div>
              <h2 className="text-2xl font-black text-white">{selectedExercise.title}</h2>
            </div>

            {selectedExercise.aiTracked ? (
              <button
                onClick={() => navigate('workout')}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-95 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Launch Live Tracking</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
                Instructional Only
              </div>
            )}
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            {selectedExercise.description}
          </p>

          {/* Target Muscles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Primary Muscles Engaged
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedExercise.targetMuscles.map((muscle, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-cyan-300 font-medium"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Movement Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Step-by-Step Execution
            </h4>
            <div className="space-y-3">
              {selectedExercise.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Cues & Biomechanics */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Biomechanical Form Cues</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedExercise.formCues.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Modifications & Safety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-1.5">
              <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                Beginner Modifications
              </span>
              {selectedExercise.modifications.map((mod, idx) => (
                <p key={idx} className="text-slate-400">{mod}</p>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-1.5">
              <span className="font-bold text-rose-300 block text-[11px] uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Safety Reminders
              </span>
              {selectedExercise.safetyNotes.map((note, idx) => (
                <p key={idx} className="text-slate-400">{note}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
