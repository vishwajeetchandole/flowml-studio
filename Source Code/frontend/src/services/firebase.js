import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

// ── Firebase Configuration from Environment ──────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Determine if real Firebase config is provided (not empty or dummy)
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'placeholder' &&
  !firebaseConfig.apiKey.includes('your-') &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'placeholder'
);

let forceDevAuth = import.meta.env.VITE_DEV_AUTH === 'true' || !isConfigured;

let app = null;
let realAuth = null;

if (!forceDevAuth && isConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    realAuth = getAuth(app);
  } catch (err) {
    console.warn('[Firebase] Initialization failed, falling back to DEV_AUTH mock:', err);
    forceDevAuth = true;
  }
}

// ── DEV_AUTH Mock State ───────────────────────────────────────────────────────
const DEV_STORAGE_KEY = 'flowml_dev_auth_user';
const DEV_USERS_KEY = 'flowml_registered_users';

function getStoredDevUser() {
  try {
    const raw = localStorage.getItem(DEV_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredDevUser(u) {
  if (u) {
    localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(u));
  } else {
    localStorage.removeItem(DEV_STORAGE_KEY);
  }
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(DEV_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(DEV_USERS_KEY, JSON.stringify(users));
}

// Dev subscribers
const devAuthListeners = new Set();
let currentDevUser = getStoredDevUser();

// If no user is logged in on first dev run, seed a default demo user
if (!currentDevUser && forceDevAuth) {
  currentDevUser = {
    uid: 'dev-user-demo',
    email: 'engineer@flowml.studio',
    displayName: 'FlowML Engineer',
    emailVerified: true,
    photoURL: null,
    isDev: true,
    createdAt: new Date().toISOString(),
  };
  setStoredDevUser(currentDevUser);
}

function notifyDevListeners(user) {
  currentDevUser = user;
  setStoredDevUser(user);
  devAuthListeners.forEach((cb) => cb(user));
}

// ── Public Auth Methods ───────────────────────────────────────────────────────

export const isDevMode = forceDevAuth;

export const getFirebaseConfigStatus = () => ({
  isConfigured,
  isDevMode: forceDevAuth,
  projectId: firebaseConfig.projectId || 'dev-local-project',
  hasApiKey: Boolean(firebaseConfig.apiKey),
});

/**
 * Sign in with email & password
 */
export async function loginWithEmail(email, password) {
  if (!forceDevAuth && realAuth) {
    const cred = await signInWithEmailAndPassword(realAuth, email, password);
    return cred.user;
  }

  // Dev Mock
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (existing && existing.password !== password) {
    throw new Error('Invalid credentials. Password does not match.');
  }

  const user = {
    uid: existing?.uid || `dev-user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email,
    displayName: existing?.displayName || email.split('@')[0],
    emailVerified: existing?.emailVerified ?? true,
    photoURL: null,
    isDev: true,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  notifyDevListeners(user);
  return user;
}

/**
 * Register a new user
 */
export async function registerWithEmail(email, password, displayName = '') {
  if (!forceDevAuth && realAuth) {
    const cred = await createUserWithEmailAndPassword(realAuth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await sendEmailVerification(cred.user);
    return cred.user;
  }

  // Dev Mock
  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    uid: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email,
    password,
    displayName: displayName || email.split('@')[0],
    emailVerified: false,
    createdAt: new Date().toISOString(),
    isDev: true,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const sessionUser = {
    uid: newUser.uid,
    email: newUser.email,
    displayName: newUser.displayName,
    emailVerified: false,
    isDev: true,
  };

  notifyDevListeners(sessionUser);
  return sessionUser;
}

/**
 * Reset password
 */
export async function sendPasswordReset(email) {
  if (!forceDevAuth && realAuth) {
    return sendPasswordResetEmail(realAuth, email);
  }
  // Dev Mock — simulates sending email
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, email };
}

/**
 * Resend email verification
 */
export async function sendVerification() {
  if (!forceDevAuth && realAuth && realAuth.currentUser) {
    return sendEmailVerification(realAuth.currentUser);
  }
  // Dev Mock — marks verified or sends mock email
  if (currentDevUser) {
    currentDevUser.emailVerified = true;
    notifyDevListeners({ ...currentDevUser });
  }
  return { success: true };
}

/**
 * Sign out
 */
export async function logoutUser() {
  if (!forceDevAuth && realAuth) {
    return fbSignOut(realAuth);
  }
  notifyDevListeners(null);
}

/**
 * Get current Auth ID token for API calls
 */
export async function getCurrentIdToken() {
  if (!forceDevAuth && realAuth && realAuth.currentUser) {
    return realAuth.currentUser.getIdToken();
  }
  // In DEV_AUTH, the raw token value IS the uid accepted by FastAPI backend
  return currentDevUser?.uid || 'dev-user-demo';
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(callback) {
  if (!forceDevAuth && realAuth) {
    return onAuthStateChanged(realAuth, (user) => {
      callback(user);
    });
  }

  // Dev mock subscription
  devAuthListeners.add(callback);
  callback(currentDevUser);
  return () => {
    devAuthListeners.delete(callback);
  };
}
