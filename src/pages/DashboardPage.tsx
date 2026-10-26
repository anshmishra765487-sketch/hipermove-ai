import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Activity, 
  Flame, 
  Clock, 
  Award, 
  ChevronRight, 
  History, 
  BookOpen, 
  User, 
  Sparkles, 
  Calendar,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserWorkouts } from '../services/firebase';
import { WorkoutSession } from '../types';

interface DashboardPageProps {
  navigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { currentUser, userProfile } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const data = await fetchUserWorkouts(currentUser.uid);
      setWorkouts(data);
    } catch (err) {
      console.warn('Could not fetch workouts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Real statistics calculated strictly from saved sessions
  const totalWorkouts = workouts.length;
  const totalSquats = workouts.reduce((acc, curr) => acc + (curr.repsCount || 0), 0);
  const totalDurationSeconds = workouts.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const avgRepsPerSession = totalWorkouts > 0 ? Math.round(totalSquats / totalWorkouts) : 0;

  // Format total duration into hours and minutes
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  // Today's squats calculated from real data
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySquats = workouts
    .filter(w => w.completedAt && w.completedAt.startsWith(todayStr))
    .reduce((acc, curr) => acc + (curr.repsCount || 0), 0);

  const dailyGoal = userProfile?.dailySquatsTarget || 30;
  const goalProgress = Math.min(100, Math.round((todaySquats / dailyGoal) * 100));

  // 7-day weekly activity chart data derived strictly from saved sessions
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayReps = workouts
      .filter(w => w.completedAt && w.completedAt.startsWith(dateKey))
      .reduce((acc, curr) => acc + (curr.repsCount || 0), 0);

    return {
      dateKey,
      dayLabel,
      reps: dayReps
    };
  });

  const maxWeeklyReps = Math.max(...last7Days.map(d => d.reps), 25);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hello, {userProfile?.displayName || 'Athlete'}
            </h1>
            <span className="w-2 h-2 rounded-full bg-lime-400" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Focus: <span className="text-cyan-400 capitalize">{userProfile?.fitnessGoal?.replace('_', ' ') || 'General Fitness'}</span> • Level: <span className="text-lime-400 capitalize">{userProfile?.experienceLevel || 'Beginner'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setRefreshing(true); loadData(); }}
            title="Refresh dashboard stats"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => navigate('workout')}
            className="px-5 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-95 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start Workout</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Squats */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Squats</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
            {totalSquats.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-cyan-400 font-semibold">{todaySquats}</span> reps completed today
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Completed Sessions */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Workouts</span>
            <Flame className="w-4 h-4 text-lime-400" />
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
            {totalWorkouts}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Avg {avgRepsPerSession} reps / session
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-lime-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Total Training Time */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Active Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
            {totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {totalDurationSeconds}s total under tension
          </p>
        </div>

        {/* Card 4: Daily Target Progress */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Today's Target</span>
            <Award className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-lime-400">{todaySquats}</span>
            <span className="text-xs text-slate-400">/ {dailyGoal} reps</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-lime-400 h-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Weekly Squat Volume</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Repetitions recorded over the last 7 calendar days</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
              {last7Days.reduce((a, b) => a + b.reps, 0)} total this week
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-8 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44">
              {last7Days.map((item, idx) => {
                const heightPercent = maxWeeklyReps > 0 ? Math.round((item.reps / maxWeeklyReps) * 100) : 0;
                const isToday = idx === 6;

                return (
                  <div key={item.dateKey} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {item.reps}
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-32 relative">
                      <div 
                        className={`w-full transition-all duration-500 rounded-t-lg ${
                          isToday 
                            ? 'bg-gradient-to-t from-cyan-500 to-lime-400 shadow-sm shadow-lime-500/20' 
                            : item.reps > 0 
                            ? 'bg-cyan-500/80' 
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(item.reps > 0 ? 12 : 0, heightPercent)}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-medium mt-2 ${isToday ? 'text-lime-400 font-bold' : 'text-slate-400'}`}>
                      {item.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Threshold: Depth ≤102° • Upright ≥155°</span>
            <button 
              onClick={() => navigate('history')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View full history</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Launch & Guidance (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/40 relative">
            <h3 className="text-base font-bold text-white mb-2">Live AI Pose Workout</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Real-time squat tracking with skeletal overlay, live joint angle gauge, and audible depth cues.
            </p>
            <button
              onClick={() => navigate('workout')}
              className="w-full py-3 rounded-xl font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-lime-500/20"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch Camera Tracker</span>
            </button>
          </div>

          {/* Exercise Library Quick Link */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Movement Guides</h4>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Learn proper bodyweight squat technique, joint alignment cues, and beginner modifications.
            </p>
            <button
              onClick={() => navigate('library')}
              className="w-full py-2.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Browse Exercise Library</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Workout Sessions Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-lime-400" />
              <span>Recent Workout Sessions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real sessions recorded and saved to your account</p>
          </div>
          {workouts.length > 0 && (
            <button
              onClick={() => navigate('history')}
              className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>See all ({workouts.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
            <span>Loading workout telemetry...</span>
          </div>
        ) : workouts.length === 0 ? (
          /* Honest Empty State: Never fabricate workouts */
          <div className="py-12 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-slate-500" />
            </div>
            <h4 className="text-sm font-bold text-white">No workouts recorded yet</h4>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Launch the live webcam tracker and complete your first set of squats to start recording data.
            </p>
            <button
              onClick={() => navigate('workout')}
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 text-xs hover:opacity-95 transition-opacity inline-flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Record First Workout</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {workouts.slice(0, 5).map((session) => (
              <div key={session.id || session.completedAt} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-mono font-bold text-sm text-lime-400">
                    {session.repsCount}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white capitalize">{session.exerciseName || 'Bodyweight Squats'}</h5>
                    <p className="text-xs text-slate-400">{formatDate(session.completedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right hidden sm:block">
                    <span className="text-slate-300 font-medium block">{formatDuration(session.durationSeconds)}</span>
                    {session.minKneeAngle ? (
                      <span className="text-[11px] text-cyan-400 font-mono">Min angle: {session.minKneeAngle}°</span>
                    ) : null}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    session.trackingQuality === 'optimal'
                      ? 'bg-lime-500/10 text-lime-400 border border-lime-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {session.trackingQuality || 'Optimal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
