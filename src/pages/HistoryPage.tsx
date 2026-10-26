import React, { useEffect, useState } from 'react';
import { 
  History as HistoryIcon, 
  Calendar, 
  Clock, 
  Activity, 
  Trash2, 
  Filter, 
  Play, 
  ChevronRight,
  RefreshCw,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserWorkouts, deleteWorkoutSession } from '../services/firebase';
import { WorkoutSession } from '../types';

interface HistoryPageProps {
  navigate: (route: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRange, setFilterRange] = useState<'all' | '7days' | '30days'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadWorkouts = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchUserWorkouts(currentUser.uid);
      setWorkouts(data);
    } catch (err) {
      console.warn('Failed to load workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [currentUser]);

  const handleDelete = async (workoutId?: string) => {
    if (!workoutId) return;
    if (!confirm('Are you sure you want to delete this recorded workout session?')) return;
    setDeletingId(workoutId);
    try {
      await deleteWorkoutSession(workoutId);
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    } catch (err) {
      console.error('Failed to delete workout:', err);
      alert('Could not delete workout session. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter logic
  const now = new Date().getTime();
  const filteredWorkouts = workouts.filter((w) => {
    if (filterRange === 'all') return true;
    const sessionTime = new Date(w.completedAt).getTime();
    const diffDays = (now - sessionTime) / (1000 * 3600 * 24);
    if (filterRange === '7days') return diffDays <= 7;
    if (filterRange === '30days') return diffDays <= 30;
    return true;
  });

  const totalFilteredReps = filteredWorkouts.reduce((acc, curr) => acc + (curr.repsCount || 0), 0);
  const totalFilteredSeconds = filteredWorkouts.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const bestSessionReps = filteredWorkouts.length > 0 ? Math.max(...filteredWorkouts.map(w => w.repsCount || 0)) : 0;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <HistoryIcon className="w-7 h-7 text-cyan-400" />
              <span>Workout History</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Permanent record of your computer vision squat sessions and biomechanical telemetry.
          </p>
        </div>

        <button
          onClick={() => navigate('workout')}
          className="px-4 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-95 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 text-xs"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          <span>New Workout</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Reps Recorded</span>
          <span className="font-mono text-3xl font-extrabold text-lime-400">{totalFilteredReps.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Best Single Session</span>
          <span className="font-mono text-3xl font-extrabold text-cyan-400">{bestSessionReps} reps</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Cumulative Time</span>
          <span className="font-mono text-3xl font-extrabold text-white">{formatDuration(totalFilteredSeconds)}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setFilterRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterRange === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilterRange('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterRange === '30days' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setFilterRange('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterRange === '7days' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
        </div>

        <button
          onClick={loadWorkouts}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-2"
          title="Reload history"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Workout Sessions List */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <span>Fetching workout history from Cloud Firestore...</span>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3">
              <HistoryIcon className="w-6 h-6 text-slate-500" />
            </div>
            <h4 className="text-sm font-bold text-white">No workouts found for this period</h4>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Complete a live camera session to start building your record.
            </p>
            <button
              onClick={() => navigate('workout')}
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 text-xs inline-flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Record Squats Now</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id || workout.completedAt}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left Col: Reps Badge & Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-700 flex flex-col items-center justify-center shrink-0">
                    <span className="font-mono text-xl font-black text-lime-400">{workout.repsCount}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Reps</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm capitalize">
                        {workout.exerciseName || 'Bodyweight Squats'}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                        {workout.trackingQuality || 'Optimal'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(workout.completedAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {formatDuration(workout.durationSeconds)}
                      </span>
                    </div>

                    {workout.notes && (
                      <p className="text-xs text-slate-300 italic mt-1.5 pl-2 border-l-2 border-cyan-500/40">
                        "{workout.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Col: Depth & Delete Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  {workout.minKneeAngle && (
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Max Depth</span>
                      <span className="font-mono font-bold text-cyan-400">{workout.minKneeAngle}°</span>
                    </div>
                  )}

                  {workout.id && (
                    <button
                      onClick={() => handleDelete(workout.id)}
                      disabled={deletingId === workout.id}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete this session record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
