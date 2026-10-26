import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  RotateCcw, 
  Save, 
  Share2, 
  ChevronRight, 
  Activity,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveWorkoutSession } from '../services/firebase';
import { WorkoutSession } from '../types';

interface SummaryPageProps {
  session: WorkoutSession | null;
  navigate: (route: string) => void;
}

export const SummaryPage: React.FC<SummaryPageProps> = ({ session, navigate }) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Activity className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No workout data found</h2>
        <p className="text-xs text-slate-400 mb-6">Start a new workout to record your reps and time.</p>
        <button
          onClick={() => navigate('workout')}
          className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400"
        >
          Start Squat Session
        </button>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handleSave = async () => {
    if (saved) return;
    setSaving(true);
    setSaveError(null);

    try {
      const workoutToSave: WorkoutSession = {
        ...session,
        userId: currentUser?.uid || 'guest-athlete',
        notes: notes.trim() || undefined,
        completedAt: session.completedAt || new Date().toISOString()
      };

      await saveWorkoutSession(workoutToSave);
      setSaved(true);
    } catch (err) {
      console.error('Failed to save workout session:', err);
      setSaveError('Failed to save to Firestore. You can retry or return to dashboard.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-lime-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-lime-400">Workout Completed</span>
          <h2 className="text-2xl font-black text-white mt-1">Session Telemetry Summary</h2>
          <p className="text-xs text-slate-400 mt-1">{new Date(session.completedAt).toLocaleString()}</p>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Squats Completed</span>
            <span className="font-mono text-4xl font-black text-lime-400">{session.repsCount}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Full Lockout Verified</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Active Duration</span>
            <span className="font-mono text-4xl font-black text-cyan-400">{formatDuration(session.durationSeconds)}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Under Pose Tracking</span>
          </div>
        </div>

        {/* Quality and Depth Details */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-2 mb-6">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Deepest Knee Flexion Angle</span>
            <span className="font-mono font-bold text-white">
              {session.minKneeAngle ? `${session.minKneeAngle}°` : 'Parallel'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Computer Vision Quality</span>
            <span className="font-semibold text-lime-400 uppercase tracking-wider text-[11px]">
              {session.trackingQuality}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Biomechanical Standard</span>
            <span className="text-slate-300">≤102° Depth, ≥155° Lockout</span>
          </div>
        </div>

        {/* Optional Notes */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Workout Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saved}
            rows={2}
            placeholder="How did your form feel? Any notes on stance width or pace?"
            className="w-full px-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Save error message */}
        {saveError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!saved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving to Firestore...' : 'Save Workout to Profile'}</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-lime-500/15 border border-lime-500/30 text-lime-400 text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Workout Saved to Cloud Firestore!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => navigate('workout')}
              className="py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Another</span>
            </button>

            <button
              onClick={() => navigate('dashboard')}
              className="py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-white hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Back to Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
