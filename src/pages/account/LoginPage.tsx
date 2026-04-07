import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, Lock, LogIn, Mail, User as UserIcon } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Seo } from '../../components/seo/Seo';
import { BRAND_NAME } from '../../lib/seo';

enum OperationType {
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const title = `Sign In or Register | ${BRAND_NAME}`;
  const description = 'Sign in or create a Nuhafrik account to track orders, save preferences, and speed up checkout.';

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/account';

  const syncUserProfile = async (user: User, name?: string) => {
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userDocRef);
      } catch (readErr) {
        handleFirestoreError(readErr, OperationType.GET, path);
        return;
      }

      if (!userDoc.exists()) {
        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: name || user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL || null,
            role: user.email === 'netbiz0925@gmail.com' ? 'admin' : 'customer',
            created_at: serverTimestamp(),
          });
        } catch (writeErr) {
          handleFirestoreError(writeErr, OperationType.WRITE, path);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('{')) throw err;
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The login popup was closed before completion. Please try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google login is not enabled in the Firebase Console. Please contact the administrator.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await syncUserProfile(result.user, displayName);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserProfile(result.user);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Email Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in the Firebase Console. Please contact the administrator.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-stack min-h-[85vh] justify-center">
      <Seo title={title} description={description} path="/login" noindex />
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
        <ArrowLeft size={16} />
        Back to storefront
      </Link>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card-dark flex flex-col justify-between p-8 md:p-10">
          <div>
            <p className="eyebrow">Account Access</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">
              {isSignUp ? 'Create your Nuhafrik account.' : 'Welcome back to Nuhafrik.'}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[rgba(255,250,242,0.72)]">
              Sign in to manage your orders, save your preferences, and move through checkout faster.
            </p>
          </div>
          <div className="mt-8 flex gap-3">
            {[LogIn, Mail, Lock].map((Icon, index) => (
              <span key={index} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Icon size={18} className="text-[var(--color-primary)]" />
              </span>
            ))}
          </div>
        </div>

        <div className="surface-card p-8 md:p-10">
          <div className="mb-8">
            <p className="eyebrow">{isSignUp ? 'Create account' : 'Sign in'}</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">
              {isSignUp ? 'Start your account' : 'Access your account'}
            </h2>
          </div>

          {error ? (
            <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] px-4 py-3 text-sm text-[var(--color-primary-700)]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {isSignUp ? (
              <div className="field-group">
                <UserIcon className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                <input
                  type="text"
                  placeholder=" "
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="field pl-11"
                  required={isSignUp}
                />
                <label className="field-label left-11">Full Name</label>
              </div>
            ) : null}

            <div className="field-group">
              <Mail className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field pl-11"
                required
              />
              <label className="field-label left-11">Email Address</label>
            </div>

            <div className="field-group">
              <Lock className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pl-11"
                required
              />
              <label className="field-label left-11">Password</label>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              {!loading ? <ArrowRight size={18} /> : null}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">or continue with</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" size="lg" className="w-full">
            <img src="https://www.google.com/favicon.ico" alt="Google sign-in icon" className="h-5 w-5" width="20" height="20" />
            Google
          </Button>

          <div className="mt-8 space-y-4 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
            <p className="text-xs text-[var(--color-text-muted)]">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
