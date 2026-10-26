import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  auth, 
  signInWithPopup, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  fetchUserProfile,
  saveUserProfile,
  deleteUserAccountAndData
} from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigured] = useState<boolean>(true);

  const loadUserProfile = async (user: User) => {
    try {
      const profile = await fetchUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        // Create initial minimal profile
        const initialProfile: UserProfile = {
          userId: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Athlete',
          email: user.email || '',
          fitnessGoal: 'general_fitness',
          experienceLevel: 'beginner',
          dailySquatsTarget: 30,
          soundEnabled: true,
          showAngles: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfile(initialProfile);
        setUserProfile(initialProfile);
      }
    } catch (err) {
      console.warn('Could not load user profile from Firestore:', err);
      // Fallback local representation for active session
      setUserProfile({
        userId: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Athlete',
        email: user.email || '',
        fitnessGoal: 'general_fitness',
        experienceLevel: 'beginner',
        dailySquatsTarget: 30,
        soundEnabled: true,
        showAngles: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await loadUserProfile(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await loadUserProfile(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        const initialProfile: UserProfile = {
          userId: res.user.uid,
          displayName: displayName.trim() || email.split('@')[0],
          email: res.user.email || email,
          fitnessGoal: 'general_fitness',
          experienceLevel: 'beginner',
          dailySquatsTarget: 30,
          soundEnabled: true,
          showAngles: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfile(initialProfile);
        setUserProfile(initialProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) throw new Error('No user is currently signed in');
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString()
    };
    await saveUserProfile(updated);
    setUserProfile(updated);
  };

  const deleteAccount = async () => {
    if (!currentUser) throw new Error('No user signed in');
    await deleteUserAccountAndData(currentUser);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isConfigured,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        updateProfileData,
        deleteAccount,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
