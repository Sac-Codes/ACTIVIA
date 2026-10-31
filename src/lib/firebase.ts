// ACTIVIA | Firebase Configuration
// Project: activia-f36ee
// Initialize Firebase app with modular SDK

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase project configuration for activia-f36ee
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo_Replace_With_Real_Key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "activia-f36ee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "activia-f36ee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "activia-f36ee.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Initialize Firebase (prevent duplicate initialization in hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth: Firebase Authentication instance
export const auth = getAuth(app);

// Firestore: Cloud Firestore instance
export const db = getFirestore(app);

// Storage: Cloud Storage instance
export const storage = getStorage(app);

// Use emulators in development if VITE_USE_FIREBASE_EMULATOR is set
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('[Firebase] Connected to local emulators');
  } catch (e) {
    // Emulators already connected
  }
}

export default app;
