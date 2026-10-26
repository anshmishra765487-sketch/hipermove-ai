import React from 'react';
import { ShieldCheck, AlertTriangle, ArrowLeft, Camera, Lock, Cpu } from 'lucide-react';

interface LegalPagesProps {
  type: 'privacy' | 'terms';
  navigate: (route: string) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type, navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate('dashboard')}
        className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Application</span>
      </button>

      {type === 'privacy' ? (
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 text-slate-300 text-sm leading-relaxed">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
              <p className="text-xs text-slate-400">Effective Date: October 2026 • Local-First Architecture</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>1. Complete Local Webcam Processing Guarantee</span>
            </h2>
            <p>
              HiperMove AI is engineered from the ground up to protect your personal visual privacy. All computer vision calculations (MediaPipe Pose Landmarker) are executed <strong className="text-white">locally inside your browser engine</strong> using WebAssembly and your device's GPU/CPU.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 text-slate-300">
              <p>• <strong className="text-lime-400">Zero Video Transmission:</strong> Video frames are analyzed in memory and immediately discarded. No video is ever recorded, buffered to disk, or transmitted over any network.</p>
              <p>• <strong className="text-lime-400">No Audio Access:</strong> The application does not request or access your microphone.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>2. Data Stored in Cloud Firestore</span>
            </h2>
            <p>
              The only information sent to our database includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
              <li>Your athlete account details (display name, email, chosen fitness goals, and daily repetition target).</li>
              <li>Completed workout summary telemetry (count of completed reps, elapsed session duration in seconds, minimum knee flexion angle, and timestamp).</li>
            </ul>
            <p>
              Each user's records are strictly isolated via Cloud Firestore security rules. No user can view or alter another user's workout data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Right to Complete Erasure</h2>
            <p>
              You have the right to delete your profile and all associated workout history at any time through the <strong className="text-white">Profile & Settings</strong> page. Upon confirmation, all documents are immediately deleted from Firestore.
            </p>
          </section>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 text-slate-300 text-sm leading-relaxed">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Terms of Use & Medical Disclaimer</h1>
              <p className="text-xs text-slate-400">Effective Date: October 2026</p>
            </div>
          </div>

          <section className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200 text-xs leading-relaxed space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-amber-400 text-sm">IMPORTANT MEDICAL DISCLAIMER</h3>
            <p>
              HiperMove AI is strictly an educational fitness and motion tracking utility. It is <strong className="underline">NOT</strong> a medical device, diagnostic system, physical therapy prescription, or substitute for individualized professional healthcare advice.
            </p>
            <p>
              Always consult with a licensed physician or certified sports professional before initiating any exercise program, particularly if you have pre-existing joint, spinal, or cardiovascular conditions.
            </p>
          </section>

          <section className="space-y-2 text-xs text-slate-400">
            <h2 className="text-base font-bold text-white">1. Voluntary Physical Activity & Risk Assumption</h2>
            <p>
              Physical exercise carries inherent risks of injury. By utilizing HiperMove AI, you voluntarily engage in movement exercises at your own risk. If you experience acute pain, lightheadedness, shortness of breath, joint popping with pain, or nausea, <strong className="text-white">cease exercising immediately</strong> and seek medical guidance.
            </p>
          </section>

          <section className="space-y-2 text-xs text-slate-400">
            <h2 className="text-base font-bold text-white">2. Accuracy of Biomechanical Angles</h2>
            <p>
              Joint angle calculations derived from single 2D webcam monocular video are approximations subject to camera angle, clothing fit, lighting, and frame rate. HiperMove AI makes no claim of clinical laboratory precision.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
