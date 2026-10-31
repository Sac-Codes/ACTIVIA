// ACTIVIA | Firestore Data Service
// Provides CRUD operations for all Firestore collections
// Replaces localStorage/mock data with real cloud persistence

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryConstraint,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firebaseAuth';
import type {
  Activity,
  Announcement,
  NotificationItem,
  Club,
  House,
  VerifiedAchievement,
  CalendarEvent,
  FeedbackTicket,
  AuditLog,
} from '../types';

// ─── Generic Helpers ───────────────────────────────────────────────────────────

async function getCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const ref = collection(db, collectionName);
  const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function getActivities(filter?: {
  category?: string;
  status?: string;
}): Promise<Activity[]> {
  const constraints: QueryConstraint[] = [orderBy('date', 'desc')];
  if (filter?.status) {
    constraints.unshift(where('status', '==', filter.status));
  }
  if (filter?.category) {
    constraints.unshift(where('category', '==', filter.category));
  }
  return getCollection<Activity>(COLLECTIONS.ACTIVITIES, constraints);
}

export async function getActivityById(id: string): Promise<Activity | null> {
  return getDocument<Activity>(COLLECTIONS.ACTIVITIES, id);
}

export async function createActivity(
  activityData: Omit<Activity, 'id'>,
  creatorUid: string
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
    ...activityData,
    createdBy: creatorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateActivity(
  id: string,
  updates: Partial<Activity>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.ACTIVITIES, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteActivity(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ACTIVITIES, id));
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function getAnnouncements(limitCount = 50): Promise<Announcement[]> {
  return getCollection<Announcement>(COLLECTIONS.ANNOUNCEMENTS, [
    orderBy('date', 'desc'),
    limit(limitCount),
  ]);
}

export async function createAnnouncement(
  data: Omit<Announcement, 'id'>,
  authorUid: string
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), {
    ...data,
    authorUid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, id));
}

// ─── Clubs ────────────────────────────────────────────────────────────────────

export async function getClubs(): Promise<Club[]> {
  return getCollection<Club>(COLLECTIONS.CLUBS, [orderBy('name', 'asc')]);
}

export async function getClubById(id: string): Promise<Club | null> {
  return getDocument<Club>(COLLECTIONS.CLUBS, id);
}

export async function createClub(data: Omit<Club, 'id'>, creatorUid: string): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.CLUBS), {
    ...data,
    createdBy: creatorUid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Houses ───────────────────────────────────────────────────────────────────

export async function getHouses(): Promise<House[]> {
  return getCollection<House>(COLLECTIONS.HOUSES, [orderBy('points', 'desc')]);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getUserNotifications(
  uid: string,
  limitCount = 30
): Promise<NotificationItem[]> {
  return getCollection<NotificationItem>(COLLECTIONS.NOTIFICATIONS, [
    where('recipientUid', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(limitCount),
  ]);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), { isRead: true });
}

export async function createNotification(
  data: Omit<NotificationItem, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...data,
    timestamp: serverTimestamp(),
    isRead: false,
  });
  return ref.id;
}

// ─── Achievements / Portfolio ─────────────────────────────────────────────────

export async function getUserAchievements(uid: string): Promise<VerifiedAchievement[]> {
  return getCollection<VerifiedAchievement>(COLLECTIONS.ACHIEVEMENTS, [
    where('studentUid', '==', uid),
    orderBy('date', 'desc'),
  ]);
}

export async function createAchievement(
  data: Omit<VerifiedAchievement, 'id'>,
  verifierUid: string
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.ACHIEVEMENTS), {
    ...data,
    verifiedByUid: verifierUid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function getAuditLogs(limitCount = 100): Promise<AuditLog[]> {
  return getCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS, [
    orderBy('timestamp', 'desc'),
    limit(limitCount),
  ]);
}

export async function logAuditEvent(
  action: string,
  entity: string,
  actorUid: string,
  actorName: string,
  details: string
): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), {
    action,
    entity,
    actorUid,
    actorName,
    details,
    timestamp: serverTimestamp(),
  });
}

// ─── Calendar Events ──────────────────────────────────────────────────────────

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return getCollection<CalendarEvent>('calendar_events', [orderBy('date', 'asc')]);
}

// ─── Feedback Tickets ─────────────────────────────────────────────────────────

export async function getFeedbackTickets(uid?: string): Promise<FeedbackTicket[]> {
  const constraints: QueryConstraint[] = [orderBy('submittedAt', 'desc')];
  if (uid) constraints.unshift(where('submittedByUid', '==', uid));
  return getCollection<FeedbackTicket>('feedback_tickets', constraints);
}

// ─── Realtime Listener (for live updates) ─────────────────────────────────────

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (docs: T[]) => void
): () => void {
  const ref = collection(db, collectionName);
  const q = query(ref, ...constraints);
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    callback(docs);
  });
}

// ─── Batch Seed: Migrate localStorage data to Firestore ──────────────────────
// Called once to populate Firestore from existing localStorage/mock data

export async function seedFirestoreFromLocalData(
  activities: Activity[],
  announcements: Announcement[],
  clubs: Club[],
  houses: House[]
): Promise<void> {
  const batch = writeBatch(db);

  activities.forEach((act) => {
    const ref = doc(db, COLLECTIONS.ACTIVITIES, act.id);
    batch.set(ref, { ...act, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
  });

  announcements.forEach((ann) => {
    const ref = doc(db, COLLECTIONS.ANNOUNCEMENTS, ann.id);
    batch.set(ref, { ...ann, createdAt: serverTimestamp() }, { merge: true });
  });

  clubs.forEach((club) => {
    const ref = doc(db, COLLECTIONS.CLUBS, club.id);
    batch.set(ref, { ...club, createdAt: serverTimestamp() }, { merge: true });
  });

  houses.forEach((house) => {
    const ref = doc(db, COLLECTIONS.HOUSES, house.id);
    batch.set(ref, { ...house, createdAt: serverTimestamp() }, { merge: true });
  });

  await batch.commit();
  console.log('[Firestore] Seed migration complete');
}
