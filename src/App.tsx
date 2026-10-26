import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { SummaryPage } from './pages/SummaryPage';
import { HistoryPage } from './pages/HistoryPage';
import { ExerciseLibraryPage } from './pages/ExerciseLibraryPage';
import { ProfilePage } from './pages/ProfilePage';
import { LegalPages } from './pages/LegalPages';
import { testConnection } from './services/firebase';
import { WorkoutSession } from './types';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { currentUser, userProfile, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('welcome');
  const [lastWorkoutSession, setLastWorkoutSession] = useState<WorkoutSession | null>(null);

  // Connectivity boot test
  useEffect(() => {
    testConnection().then((connected) => {
      if (!connected) {
        console.warn('HiperMove AI: Firestore client test indicated offline.');
      }
    });
  }, []);

  // Update default route when auth state finishes loading
  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        // If current route is welcome or an auth route, route into dashboard
        if (['welcome', 'auth_signin', 'auth_signup', 'auth_forgot'].includes(currentRoute)) {
          setCurrentRoute('dashboard');
        }
      }
    }
  }, [currentUser, loading]);

  const navigate = (route: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute(route);
  };

  const handleFinishWorkout = (session: WorkoutSession) => {
    setLastWorkoutSession(session);
    setCurrentRoute('summary');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
        <span className="text-xs font-semibold tracking-wider uppercase">Loading HiperMove AI...</span>
      </div>
    );
  }

  // Protected route checking
  const isProtected = ['dashboard', 'history', 'profile', 'onboarding'].includes(currentRoute);
  if (isProtected && !currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#090d16]">
        <Navbar currentRoute={currentRoute} navigate={navigate} />
        <main className="flex-1">
          <AuthPage initialMode="signin" navigate={navigate} />
        </main>
        <Footer navigate={navigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900">
      {/* Hide standard navbar in live workout mode for distraction-free camera HUD */}
      {currentRoute !== 'workout' && <Navbar currentRoute={currentRoute} navigate={navigate} />}

      <main className="flex-1">
        {currentRoute === 'welcome' && <LandingPage navigate={navigate} />}
        {currentRoute === 'auth_signin' && <AuthPage initialMode="signin" navigate={navigate} />}
        {currentRoute === 'auth_signup' && <AuthPage initialMode="signup" navigate={navigate} />}
        {currentRoute === 'auth_forgot' && <AuthPage initialMode="forgot" navigate={navigate} />}
        {currentRoute === 'onboarding' && <OnboardingPage navigate={navigate} />}
        {currentRoute === 'dashboard' && <DashboardPage navigate={navigate} />}
        {currentRoute === 'workout' && (
          <WorkoutPage navigate={navigate} onFinishWorkout={handleFinishWorkout} />
        )}
        {currentRoute === 'summary' && (
          <SummaryPage session={lastWorkoutSession} navigate={navigate} />
        )}
        {currentRoute === 'history' && <HistoryPage navigate={navigate} />}
        {currentRoute === 'library' && <ExerciseLibraryPage navigate={navigate} />}
        {currentRoute === 'profile' && <ProfilePage navigate={navigate} />}
        {currentRoute === 'privacy' && <LegalPages type="privacy" navigate={navigate} />}
        {currentRoute === 'terms' && <LegalPages type="terms" navigate={navigate} />}
      </main>

      {currentRoute !== 'workout' && <Footer navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
