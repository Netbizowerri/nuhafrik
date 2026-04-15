import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

type FirebaseAppletConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  firestoreDatabaseId?: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export const ADMIN_EMAILS = ['nuhafrikclothings@gmail.com'] as const;
export const PRIMARY_ADMIN_EMAIL = ADMIN_EMAILS[0];

export const firebaseConfig: FirebaseAppletConfig = {
  ...firebaseConfigJson,
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || '(default)',
};

export const isConfiguredAdminEmail = (email?: string | null) =>
  Boolean(
    email &&
      ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.trim().toLowerCase())
  );

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

export default app;
