'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, isConfiguredAdminEmail } from '../lib/firebase';
import { isPermissionDeniedError } from '../lib/firebaseErrors';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const buildFallbackProfile = (user: User): UserProfile => {
  const displayName = user.displayName?.trim() || user.email?.split('@')[0] || 'Nuhafrik Customer';

  return {
    uid: user.uid,
    email: user.email?.trim().toLowerCase() || null,
    displayName,
    name: displayName,
    phone: '',
    photoURL: user.photoURL,
    role: isConfiguredAdminEmail(user.email) ? 'admin' : 'customer',
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        const fallbackProfile = buildFallbackProfile(currentUser);

        // Listen to user profile for real-time updates (including admin role)
        unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setProfile({
              ...fallbackProfile,
              ...profile,
              role: profile.role === 'admin' || isConfiguredAdminEmail(profile.email || currentUser.email) ? 'admin' : 'customer',
            });
          } else {
            setProfile(fallbackProfile);
          }
          setLoading(false);
        }, (error) => {
          if (isPermissionDeniedError(error)) {
            console.warn('Falling back to authenticated user profile because Firestore profile access is denied.', error);
            setProfile(fallbackProfile);
          } else {
            console.error('Error listening to user profile:', error);
            setProfile(null);
          }
          setLoading(false);
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isAdmin = Boolean(profile?.role === 'admin' || isConfiguredAdminEmail(profile?.email || user?.email));

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
