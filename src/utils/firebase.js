// Firebase app initialization - Firebase setup karne ke liye
import { initializeApp, getApps } from "firebase/app";
// Firebase authentication - login/signup features ke liye
import { getAuth } from "firebase/auth";

// Firebase configuration - app ke credentials (.env file se aa rahe security ke liye)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Analytics disabled to prevent Google Tag Manager conflicts
export const analytics = null;

let auth;

try {
  // Only initialize if API key is present
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase API key not set. Running in demo mode.');
  }
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  console.log('[NEXUS] Firebase initialized successfully');
} catch (error) {
  console.warn('[NEXUS] Firebase not configured - running in demo mode:', error.message);
  // Minimal mock auth object - onAuthStateChanged is patched separately below
  auth = {
    currentUser: null,
    app: { name: 'demo' },
    _isDemo: true,
  };
}

// If running in demo mode, patch onAuthStateChanged to always return unauthenticated
// This prevents the app from crashing when Firebase is not configured
if (auth._isDemo) {
  // We need to intercept the firebase/auth onAuthStateChanged calls
  // The cleanest way is to store the mock on auth so ProtectedRoute and Body can detect it
  auth._mockOnAuthStateChanged = (callback) => {
    // Immediately invoke callback with null (unauthenticated)
    setTimeout(() => callback(null), 0);
    return () => {}; // unsubscribe no-op
  };
}

export { auth };