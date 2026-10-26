import React, { useState } from 'react';
import { 
  Activity, 
  Dumbbell, 
  History, 
  BookOpen, 
  User as UserIcon, 
  Menu, 
  X, 
  LogOut, 
  Play,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateAndDownloadProjectZip } from '../services/projectExporter';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('welcome');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await generateAndDownloadProjectZip();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => navigate(currentUser ? 'dashboard' : 'welcome')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-lime-400 p-[2px] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 group-hover:text-lime-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  HiperMove <span className="text-cyan-400">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-lime-500/20 text-lime-400 border border-lime-500/30">
                  CV 1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Move Smarter. Train Better.</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => navigate('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentRoute === 'dashboard'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => navigate('workout')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    currentRoute === 'workout'
                      ? 'bg-lime-500 text-slate-950 shadow-md shadow-lime-500/20'
                      : 'bg-lime-500/20 text-lime-400 border border-lime-500/40 hover:bg-lime-500 hover:text-slate-950'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Workout
                </button>

                <button
                  onClick={() => navigate('history')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentRoute === 'history'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </button>

                <button
                  onClick={() => navigate('library')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentRoute === 'library'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Library
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('welcome')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentRoute === 'welcome'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => navigate('library')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentRoute === 'library'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Exercises
                </button>
              </>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick PC Download button */}
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              title="Download complete HiperMove-AI project to your PC (.zip)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce text-cyan-400' : 'text-slate-400'}`} />
              <span>{isExporting ? 'Packaging...' : 'Export ZIP'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('profile')}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border transition-colors ${
                    currentRoute === 'profile'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-lime-400 flex items-center justify-center text-slate-950 font-bold text-xs">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate">
                    {userProfile?.displayName || 'My Profile'}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/30"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('auth_signin')}
                  className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('auth_signup')}
                  className="px-4 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-lg hover:opacity-95 transition-opacity shadow-sm shadow-cyan-500/20"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#090d16]/95 px-4 pt-2 pb-6 space-y-2">
          {currentUser ? (
            <>
              <div className="px-3 py-2 border-b border-slate-800 mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-white">{userProfile?.displayName || currentUser.email}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Athlete
                </span>
              </div>

              <button
                onClick={() => { navigate('dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                Dashboard
              </button>

              <button
                onClick={() => { navigate('workout'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold bg-lime-500/20 text-lime-400 border border-lime-500/30 flex items-center gap-2.5"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Live Workout
              </button>

              <button
                onClick={() => { navigate('history'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <History className="w-4 h-4 text-cyan-400" />
                Workout History
              </button>

              <button
                onClick={() => { navigate('library'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Exercise Library
              </button>

              <button
                onClick={() => { navigate('profile'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <UserIcon className="w-4 h-4 text-cyan-400" />
                Profile & Settings
              </button>

              <button
                onClick={() => { handleExportZip(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2.5"
              >
                <Download className="w-4 h-4 text-slate-400" />
                Export HiperMove-AI.zip
              </button>

              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 pt-3 border-t border-slate-800"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate('welcome'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Overview
              </button>
              <button
                onClick={() => { navigate('library'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Exercise Library
              </button>
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => { navigate('auth_signin'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { navigate('auth_signup'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
