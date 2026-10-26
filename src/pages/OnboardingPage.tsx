import React, { useState } from 'react';
import { 
  Activity, 
  Target, 
  Award, 
  ShieldCheck, 
  Camera, 
  Volume2, 
  ArrowRight, 
  Check, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OnboardingPageProps {
  navigate: (route: string) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ navigate }) => {
  const { userProfile, updateProfileData } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [fitnessGoal, setFitnessGoal] = useState<'general_fitness' | 'strength' | 'fat_loss' | 'mobility'>(
    userProfile?.fitnessGoal || 'general_fitness'
  );
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    userProfile?.experienceLevel || 'beginner'
  );
  const [dailyTarget, setDailyTarget] = useState<number>(userProfile?.dailySquatsTarget || 30);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(userProfile?.soundEnabled ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileData({
        displayName: displayName.trim() || 'Athlete',
        fitnessGoal,
        experienceLevel,
        dailySquatsTarget: Number(dailyTarget) || 30,
        soundEnabled,
        showAngles: true
      });
      navigate('dashboard');
    } catch (err) {
      console.error('Failed to save profile during onboarding:', err);
      navigate('dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
          <Activity className="w-3.5 h-3.5" />
          <span>Athlete Onboarding</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Welcome to HiperMove AI</h1>
        <p className="text-sm text-slate-400 mt-2">
          Tailor your repetition tracking thresholds and training preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-xl">
        {/* Athlete Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Athlete Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or handle"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Primary Fitness Goal */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Primary Training Focus</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'general_fitness', label: 'General Fitness', desc: 'Daily functional mobility & tone' },
              { id: 'strength', label: 'Strength & Hypertrophy', desc: 'Deep squat power & leg strength' },
              { id: 'fat_loss', label: 'Conditioning & Fat Loss', desc: 'High-rep cardiovascular circuits' },
              { id: 'mobility', label: 'Mobility & Joint Health', desc: 'Controlled range of motion' }
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setFitnessGoal(item.id as typeof fitnessGoal)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  fitnessGoal === item.id
                    ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-sm shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{item.label}</span>
                  {fitnessGoal === item.id && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-lime-400" />
            <span>Squat Experience Level</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'beginner', label: 'Beginner', depth: 'Focus on balance' },
              { id: 'intermediate', label: 'Intermediate', depth: 'Parallel depth (95°-102°)' },
              { id: 'advanced', label: 'Advanced', depth: 'Deep/ATG squats (<90°)' }
            ].map((lvl) => (
              <button
                type="button"
                key={lvl.id}
                onClick={() => setExperienceLevel(lvl.id as typeof experienceLevel)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  experienceLevel === lvl.id
                    ? 'border-lime-400 bg-lime-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="block font-semibold text-xs">{lvl.label}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{lvl.depth}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Squats Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Daily Squats Target
            </label>
            <span className="font-mono text-sm font-bold text-lime-400">{dailyTarget} reps / day</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={dailyTarget}
            onChange={(e) => setDailyTarget(Number(e.target.value))}
            className="w-full accent-lime-400 bg-slate-800 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>10 reps</span>
            <span>50 reps</span>
            <span>100 reps</span>
          </div>
        </div>

        {/* Camera and Privacy Explanation Box */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Camera & Privacy Guarantee</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            HiperMove AI uses your camera exclusively for local WebAssembly pose landmark calculations. Video frames are processed in-memory and discarded instantaneously. <strong className="text-slate-200">No video or audio is ever recorded, saved, or uploaded.</strong>
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Compliant with strict zero-server video privacy standards.</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Complete Setup & Go to Dashboard</span>}
          {!saving && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
