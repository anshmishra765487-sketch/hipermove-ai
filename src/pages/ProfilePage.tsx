import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Target, 
  Award, 
  Volume2, 
  VolumeX, 
  Save, 
  Trash2, 
  LogOut, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateAndDownloadProjectZip } from '../services/projectExporter';

interface ProfilePageProps {
  navigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { currentUser, userProfile, updateProfileData, deleteAccount, logout } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [fitnessGoal, setFitnessGoal] = useState(userProfile?.fitnessGoal || 'general_fitness');
  const [experienceLevel, setExperienceLevel] = useState(userProfile?.experienceLevel || 'beginner');
  const [dailyTarget, setDailyTarget] = useState<number>(userProfile?.dailySquatsTarget || 30);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(userProfile?.soundEnabled ?? true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // PC Export status
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      await updateProfileData({
        displayName: displayName.trim() || 'Athlete',
        fitnessGoal: fitnessGoal as any,
        experienceLevel: experienceLevel as any,
        dailySquatsTarget: Number(dailyTarget) || 30,
        soundEnabled
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMsg('Failed to update profile in Cloud Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportZip = async () => {
    setExporting(true);
    try {
      await generateAndDownloadProjectZip((pct, status) => {
        setExportStatus(`${status} (${pct}%)`);
      });
      setTimeout(() => setExportStatus(null), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      setExportStatus('Failed to generate zip package.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
      navigate('welcome');
    } catch (err) {
      console.error('Account deletion error:', err);
      alert('Could not delete account. If you logged in a long time ago, please log out and log back in to verify credentials before deleting.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Profile & Preferences</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your athlete settings, privacy guarantees, and complete project export.
          </p>
        </div>

        <button
          onClick={async () => {
            await logout();
            navigate('welcome');
          }}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Col: Profile Form (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Athlete Details</h3>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully in Cloud Firestore!</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Athlete name"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="general_fitness">General Fitness & Mobility</option>
                <option value="strength">Strength & Hypertrophy</option>
                <option value="fat_loss">Conditioning & Fat Loss</option>
                <option value="mobility">Mobility & Rehabilitation</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="beginner">Beginner (Parallel / Gentle depth)</option>
                <option value="intermediate">Intermediate (Standard ≤102° depth)</option>
                <option value="advanced">Advanced (Deep squatting)</option>
              </select>
            </div>

            {/* Daily Squats Target */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Daily Squats Goal</label>
                <span className="font-mono text-xs font-bold text-lime-400">{dailyTarget} reps / day</span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="w-full accent-lime-400 bg-slate-800"
              />
            </div>

            {/* Sound Feedback toggle */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Audible Feedback Cues</span>
                <span className="text-[11px] text-slate-400">Play tone when rep depth and lockout are registered</span>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  soundEnabled ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving changes...' : 'Save Profile Preferences'}</span>
            </button>
          </form>

          {/* Account Deletion Danger Zone */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone — Delete Account</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permanently delete your profile and all associated workout history records from Cloud Firestore. This action cannot be reversed.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 transition-colors"
            >
              Delete Athlete Account & Data
            </button>
          </div>
        </div>

        {/* Right Col: Download Project & Privacy (1 col) */}
        <div className="space-y-6">
          {/* Complete Project Download Box */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Save Project on Your PC</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export the full <strong className="text-slate-200">HiperMove-AI</strong> project package including all TypeScript components, MediaPipe integration, README with VS Code setup instructions, and Firestore rules.
            </p>
            <button
              onClick={handleExportZip}
              disabled={exporting}
              className="w-full py-3 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 text-xs shadow-md shadow-cyan-500/20"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
              <span>{exporting ? 'Generating ZIP...' : 'Download HiperMove-AI.zip'}</span>
            </button>
            {exportStatus && (
              <p className="text-[11px] text-cyan-300 text-center font-medium">{exportStatus}</p>
            )}
          </div>

          {/* Privacy & Hardware Guarantee */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-lime-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy Guarantee</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computer vision runs entirely on your local GPU/CPU via WebAssembly. Neither raw frames nor processed video are ever uploaded.
            </p>
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => navigate('privacy')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Read Privacy Policy →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-rose-900/60 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Permanent Deletion</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete your account, authentication credentials, and all recorded workout sessions from Cloud Firestore.
            </p>
            <p className="text-xs text-slate-400">
              To confirm, type <strong className="text-white font-mono">DELETE</strong> below:
            </p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-800 text-white text-xs font-mono"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE' || deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
