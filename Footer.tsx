import React, { useState } from 'react';
import { Activity, ShieldCheck, Download, ExternalLink, Heart, Cpu } from 'lucide-react';
import { generateAndDownloadProjectZip } from '../services/projectExporter';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const [downloading, setDownloading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      await generateAndDownloadProjectZip((pct, status) => {
        setProgressStatus(`${status} (${pct}%)`);
      });
      setTimeout(() => setProgressStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setProgressStatus('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <footer className="bg-[#060910] border-t border-slate-800/80 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-lime-400 p-[1.5px]">
                <div className="w-full h-full bg-[#060910] rounded-[7px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-lg text-white">
                HiperMove <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Move Smarter. Train Better. Precision squat repetition tracking, joint angle analysis, and motion feedback powered by on-device computer vision.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-lime-400/90 bg-lime-950/40 px-2.5 py-1 rounded-md border border-lime-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% On-Device Pose Analysis</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Application</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('dashboard')} className="hover:text-cyan-400 transition-colors">
                  Athlete Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('workout')} className="hover:text-cyan-400 transition-colors">
                  Live Camera Squat Tracker
                </button>
              </li>
              <li>
                <button onClick={() => navigate('history')} className="hover:text-cyan-400 transition-colors">
                  Workout History Log
                </button>
              </li>
              <li>
                <button onClick={() => navigate('library')} className="hover:text-cyan-400 transition-colors">
                  Exercise Form Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Privacy & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('privacy')} className="hover:text-cyan-400 transition-colors">
                  Privacy Policy (Camera Notice)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('terms')} className="hover:text-cyan-400 transition-colors">
                  Terms of Service & Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => navigate('profile')} className="hover:text-cyan-400 transition-colors">
                  Data Management & Account
                </button>
              </li>
            </ul>
          </div>

          {/* Developer / PC Export */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Download Project</h4>
            <p className="text-xs text-slate-400 mb-3">
              Keep the full HiperMove-AI source code on your PC with complete VS Code instructions and configs.
            </p>
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-cyan-500/20"
            >
              <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'Preparing ZIP...' : 'Download HiperMove-AI.zip'}</span>
            </button>
            {progressStatus && (
              <p className="text-[11px] text-cyan-300 mt-1.5 text-center font-medium">{progressStatus}</p>
            )}
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HiperMove AI. All rights reserved. Not medical advice.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              MediaPipe Pose Landmarker
            </span>
            <span>•</span>
            <span>Cloud Firestore</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
