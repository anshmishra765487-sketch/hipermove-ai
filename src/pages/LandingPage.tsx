import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Camera, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  BarChart3, 
  CheckCircle2, 
  Play, 
  Smartphone, 
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-500/15 via-lime-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 right-[-100px] w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-8 backdrop-blur shadow-sm">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span>Real-time On-Device MediaPipe Pose Tracking</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400 font-bold">Zero Video Uploads</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Move Smarter. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-lime-400 bg-clip-text text-transparent">
            Train Better.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          HiperMove AI turns your standard webcam into a high-precision biomechanics coach. Real-time squat repetition counting, knee angle measurements, and form cues running entirely inside your browser.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => navigate('auth_signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
          >
            <span>Start Training Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('workout')}
            className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            <span>Try Live Squat Demo</span>
          </button>
        </div>

        {/* Privacy Micro-Badge */}
        <p className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-lime-400" />
          <span>Local processing: your video stream stays 100% on your machine.</span>
        </p>

        {/* Interactive Feature Visualizer Showcase */}
        <div className="mt-16 relative max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/90 p-1 border border-slate-700/80 shadow-2xl">
          <div className="relative rounded-xl bg-[#0b101c] overflow-hidden p-6 sm:p-10 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-lime-400">Computer Vision HUD</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Real-Time Joint Angle Kinematics</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950/70 border border-cyan-800/80 text-cyan-300">
                  Target Depth: ≤102°
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-lime-950/70 border border-lime-800/80 text-lime-300">
                  Lockout: ≥155°
                </span>
              </div>
            </div>

            {/* Simulated Live Tracking Matrix */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Rep Count State */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Repetition Count</span>
                <div className="my-4">
                  <span className="font-mono text-5xl font-black text-lime-400">14</span>
                  <span className="text-xs text-slate-400 ml-2">/ 20 target</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-lime-300">
                  <CheckCircle2 className="w-4 h-4 text-lime-400" />
                  <span>State machine validated</span>
                </div>
              </div>

              {/* Card 2: Joint Flexion Angle */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Knee Flexion</span>
                <div className="my-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-5xl font-black text-cyan-400">96°</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-lime-500/20 text-lime-400 font-semibold">
                      Full Depth
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-lime-400 h-full w-[85%]" />
                </div>
              </div>

              {/* Card 3: Movement Phase */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Movement Phase</span>
                <div className="my-4">
                  <span className="inline-block px-3 py-1.5 rounded-lg text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Bottom / Turnaround
                  </span>
                  <p className="text-xs text-slate-400 mt-2">Drive upward through midfoot</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-cyan-300">
                  <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Tracking 33 pose landmarks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars / Feature Highlights */}
      <section className="py-20 bg-[#0a0f1d] border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Engineered for Fitness</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              Why HiperMove AI is Different
            </p>
            <p className="mt-3 text-slate-400 text-sm">
              No fitness wearables required. No subscription traps. Just real biomechanics executed locally on your hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Computer Vision Pose Tracking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Powered by MediaPipe Pose Landmarker in WebAssembly. Evaluates 33 body landmarks 30+ times per second with hardware acceleration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-lime-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">State-Machine Squat Counter</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Rejects half-reps and jitter. Requires a complete descent below 102° and full return to 155° lockout before incrementing the counter.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Absolute Video Privacy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your webcam never transmits video to any server or cloud API. Only numerical workout stats (reps, time) are saved to your private Firestore profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-lime-400">Step-by-Step</h2>
          <p className="mt-2 text-3xl font-extrabold text-white">How to Train with HiperMove AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Position Your Device',
              desc: 'Prop your laptop or phone at waist-to-chest level. Step back 6-8 feet so your full body is visible.'
            },
            {
              num: '02',
              title: 'Enable Webcam',
              desc: 'Grant camera access. The MediaPipe Pose model initializes locally with GPU acceleration.'
            },
            {
              num: '03',
              title: 'Perform Squats',
              desc: 'Follow the live skeleton HUD. Listen for the depth chime and rep completion confirmation.'
            },
            {
              num: '04',
              title: 'Review & Persist',
              desc: 'Inspect your session duration, reps, and min knee angle. Save securely to your Cloud Firestore profile.'
            }
          ].map((step, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 relative">
              <span className="font-mono text-3xl font-black text-cyan-400/40 mb-3 block">{step.num}</span>
              <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-lime-950/60 border border-slate-700/80 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Ready to perfect your squat form?
            </h3>
            <p className="mt-3 text-slate-300 text-sm">
              Join thousands of athletes moving smarter with real-time computer vision assistance.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('auth_signup')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 transition-all shadow-md shadow-cyan-500/20"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('library')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 transition-colors"
              >
                Explore Movement Library
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
