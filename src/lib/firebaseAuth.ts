// ACTIVIA | Firebase Authentication Service
// Wraps Firebase Auth SDK for email/password flows
// Role enforcement: public self-registration always creates 'viewer' accounts
// Admin/Editor accounts are provisioned by school administrators only

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { AuthUser, UserRole, UserAccountStatus } from '../types';

// ─── Firestore Collection Names ────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  ACTIVITIES: 'activities',
  COMPETITIONS: 'competitions',
  ANNOUNCEMENTS: 'announcements',
  APPLICATIONS: 'applications',
  NOTIFICATIONS: 'notifications',
  CLUBS: 'clubs',
  HOUSES: 'houses',
  ACHIEVEMENTS: 'achievements',
  AUDIT_LOGS: 'audit_logs',
  SETTINGS: 'settings',
} as const;

// ─── Type for Firestore User Document ─────────────────────────────────────────
export interface FirestoreUserDoc {
  uid: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  className?: string;
  stream?: string;
  studentId?: string;
  house?: string;
  grade?: string;
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
  updatedAt: Timestamp | ReturnType<typeof serverTimestamp>;
}

// ─── Map Firestore Doc to AuthUser ────────────────────────────────────────────
export function mapFirestoreDocToAuthUser(doc: FirestoreUserDoc): AuthUser {
  return {
    id: doc.uid,
    username: doc.username,
    fullName: doc.fullName,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    className: doc.className,
    stream: doc.stream,
    studentId: doc.studentId,
    house: doc.house,
    grade: doc.grade,
  };
}

// ─── Register New Student Account (Viewer only via self-registration) ──────────
export async function firebaseRegisterStudent(params: {
  fullName: string;
  email: string;
  username: string;
  password: string;
  className?: string;
  stream?: string;
  studentId?: string;
  grade?: string;
}): Promise<{ user: AuthUser; message: string; status: string }> {
  // 1. Check username uniqueness in Firestore
  const usernameQuery = query(
    collection(db, COLLECTIONS.USERS),
    where('username', '==', params.username.toLowerCase().trim())
  );
  const usernameSnap = await getDocs(usernameQuery);
  if (!usernameSnap.empty) {
    throw new Error('This username is already taken. Please choose a different username.');
  }

  // 2. Create Firebase Auth account
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, params.email, params.password);
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }

  const firebaseUser = credential.user;

  // 3. Update Firebase Auth display name
  await updateProfile(firebaseUser, { displayName: params.fullName.trim() });

  // 4. Create Firestore user document with Viewer role (enforced)
  const userDoc: FirestoreUserDoc = {
    uid: firebaseUser.uid,
    username: params.username.toLowerCase().trim(),
    fullName: params.fullName.trim(),
    email: params.email.toLowerCase().trim(),
    role: 'viewer',          // SECURITY: Public registration always assigns viewer
    status: 'active',        // Auto-activate students; pending_approval optional
    className: params.className || '',
    stream: params.stream || '',
    studentId: params.studentId || generateStudentId(),
    house: '',
    grade: params.grade || params.className || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userDoc);

  return {
    user: mapFirestoreDocToAuthUser(userDoc),
    message: 'Student account created successfully. You can now sign in.',
    status: 'active',
  };
}

// ─── Sign In with Email or Username ───────────────────────────────────────────
export async function firebaseLogin(params: {
  identifier: string;  // email or username
  password: string;
}): Promise<{ user: AuthUser; firebaseUser: FirebaseUser }> {
  let email = params.identifier.trim();

  // If identifier doesn't look like an email, look up by username
  if (!email.includes('@')) {
    const usernameQuery = query(
      collection(db, COLLECTIONS.USERS),
      where('username', '==', email.toLowerCase())
    );
    const snap = await getDocs(usernameQuery);
    if (snap.empty) {
      throw new Error('No account found with that username. Please check your credentials.');
    }
    email = snap.docs[0].data().email as string;
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, params.password);
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }

  const firebaseUser = credential.user;

  // Fetch user profile from Firestore
  const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    // Edge case: Firebase Auth account exists but no Firestore profile
    // Create a minimal viewer profile automatically
    const emergencyDoc: FirestoreUserDoc = {
      uid: firebaseUser.uid,
      username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.slice(0, 8),
      fullName: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      role: 'viewer',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userDocRef, emergencyDoc);
    return { user: mapFirestoreDocToAuthUser(emergencyDoc), firebaseUser };
  }

  const userData = userSnap.data() as FirestoreUserDoc;

  // Update last login timestamp
  await updateDoc(userDocRef, { updatedAt: serverTimestamp() });

  return { user: mapFirestoreDocToAuthUser(userData), firebaseUser };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
}

// ─── Send Password Reset Email ────────────────────────────────────────────────
export async function firebaseSendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

// ─── Observe Auth State Changes ───────────────────────────────────────────────
export function onAuthStateChange(
  callback: (user: AuthUser | null, firebaseUser: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null, null);
      return;
    }

    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as FirestoreUserDoc;
        callback(mapFirestoreDocToAuthUser(userData), firebaseUser);
      } else {
        callback(null, firebaseUser);
      }
    } catch {
      callback(null, firebaseUser);
    }
  });
}

// ─── Get Current User from Firestore ─────────────────────────────────────────
export async function getCurrentUserProfile(uid: string): Promise<AuthUser | null> {
  const userDocRef = doc(db, COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userDocRef);
  if (!userSnap.exists()) return null;
  return mapFirestoreDocToAuthUser(userSnap.data() as FirestoreUserDoc);
}

// ─── Utility: Map Firebase Auth error codes to human-readable messages ────────
function mapFirebaseAuthError(err: AuthError | any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid school email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed sign-in attempts. Please wait a few minutes before trying again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been suspended. Please contact the school administrator.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled. Please contact school IT.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    default:
      return err?.message || 'Authentication failed. Please try again or contact support.';
  }
}

// ─── Utility: Generate Student ID ─────────────────────────────────────────────
function generateStudentId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `STU-${year}-${num}`;
}
