/**
 * provision-admin.mjs
 *
 * Provisions the owner/admin account in Firebase Auth and Firestore.
 *
 * Preferred usage:
 *   $env:NUHAFRIK_ADMIN_EMAIL="nuhafrikclothings@gmail.com"
 *   $env:NUHAFRIK_ADMIN_PASSWORD="your-password"
 *   node scripts/provision-admin.mjs
 *
 * If scripts/service-account.json exists, the script uses Firebase Admin SDK.
 * Otherwise it falls back to the Firebase client SDK and signs in or creates
 * the owner account directly with Email/Password auth.
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const serviceAccountPath = path.join(__dirname, 'service-account.json');
const firebaseConfigPath = path.join(repoRoot, 'firebase-applet-config.json');

const firebaseConfig = JSON.parse(readFileSync(firebaseConfigPath, 'utf-8'));

const ADMIN_EMAIL = (process.env.NUHAFRIK_ADMIN_EMAIL || 'nuhafrikclothings@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.NUHAFRIK_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.NUHAFRIK_ADMIN_NAME || 'Nuhafrik Admin';

const printSummary = (uid) => {
  console.log('');
  console.log('Admin provisioning complete.');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log('Role: admin');
  console.log(`UID: ${uid}`);
};

const upsertAdminProfile = async (db, uid, timestampValue) => {
  const userRef = db.collection('users').doc(uid);

  await userRef.set(
    {
      uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      name: ADMIN_NAME,
      phone: '',
      photoURL: null,
      role: 'admin',
      updated_at: timestampValue,
    },
    { merge: true }
  );

  const snapshot = await userRef.get();
  console.log('Firestore /users profile:', JSON.stringify(snapshot.data(), null, 2));
};

const provisionWithAdminSdk = async () => {
  const admin = (await import('firebase-admin')).default;
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  let uid;

  try {
    const existing = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existing.uid;
    console.log(`Firebase Auth account found for ${ADMIN_EMAIL}.`);

    if (ADMIN_PASSWORD) {
      await auth.updateUser(uid, {
        password: ADMIN_PASSWORD,
        displayName: existing.displayName || ADMIN_NAME,
        emailVerified: existing.emailVerified || true,
      });
      console.log('Updated the owner password from NUHAFRIK_ADMIN_PASSWORD.');
    }
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') {
      throw error;
    }

    if (!ADMIN_PASSWORD) {
      throw new Error(
        'NUHAFRIK_ADMIN_PASSWORD is required to create the owner account when it does not already exist.'
      );
    }

    const created = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME,
      emailVerified: true,
    });

    uid = created.uid;
    console.log(`Created Firebase Auth account for ${ADMIN_EMAIL}.`);
  }

  await auth.setCustomUserClaims(uid, { role: 'admin', admin: true });
  console.log('Custom claims set: { role: "admin", admin: true }.');

  await upsertAdminProfile(db, uid, admin.firestore.FieldValue.serverTimestamp());
  printSummary(uid);
};

const provisionWithClientSdk = async () => {
  if (!ADMIN_PASSWORD) {
    throw new Error(
      'NUHAFRIK_ADMIN_PASSWORD is required for client fallback because the script must sign in or create the owner account.'
    );
  }

  const [{ getApps, initializeApp }, authModule, firestoreModule] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);

  const clientApp =
    getApps().find((app) => app.name === 'owner-provisioning-client') ||
    initializeApp(firebaseConfig, 'owner-provisioning-client');

  const auth = authModule.getAuth(clientApp);
  const db = firestoreModule.getFirestore(clientApp, firebaseConfig.firestoreDatabaseId || '(default)');

  let credential;

  try {
    credential = await authModule.signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`Signed in as ${ADMIN_EMAIL}.`);
  } catch (error) {
    if (error?.code !== 'auth/invalid-credential' && error?.code !== 'auth/user-not-found') {
      throw error;
    }

    credential = await authModule.createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`Created Firebase Auth account for ${ADMIN_EMAIL} with client SDK fallback.`);
  }

  if (!credential.user.displayName) {
    await authModule.updateProfile(credential.user, { displayName: ADMIN_NAME });
  }

  await firestoreModule.setDoc(
    firestoreModule.doc(db, 'users', credential.user.uid),
    {
      uid: credential.user.uid,
      email: credential.user.email?.trim().toLowerCase() || ADMIN_EMAIL,
      displayName: credential.user.displayName || ADMIN_NAME,
      name: credential.user.displayName || ADMIN_NAME,
      phone: '',
      photoURL: credential.user.photoURL || null,
      role: 'admin',
      created_at: firestoreModule.serverTimestamp(),
      updated_at: firestoreModule.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('Ensured Firestore admin profile exists for the owner account.');
  printSummary(credential.user.uid);
};

const run = async () => {
  console.log('Nuhafrik admin provisioning');
  console.log(`Owner email: ${ADMIN_EMAIL}`);

  if (existsSync(serviceAccountPath)) {
    console.log('Using Firebase Admin SDK.');
    await provisionWithAdminSdk();
    return;
  }

  console.log('scripts/service-account.json not found. Falling back to Firebase client SDK.');
  await provisionWithClientSdk();
};

run().catch((error) => {
  console.error('Provisioning failed:', error);
  process.exit(1);
});
