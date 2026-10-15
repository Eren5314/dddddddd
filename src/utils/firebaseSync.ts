import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { WeekData, UserProfile } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Sign in anonymously on boot so we have an authenticated context if required
signInAnonymously(auth).catch((err) => {
  console.error('Firebase anonymous auth error:', err);
});

const ROADMAP_DOC_ID = 'eren_main_roadmap';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

/**
 * Load roadmap data from Firestore
 */
export async function loadRoadmapFromFirestore(): Promise<{ weeks?: WeekData[]; user?: UserProfile } | null> {
  const path = `roadmaps/${ROADMAP_DOC_ID}`;
  try {
    const docRef = doc(db, 'roadmaps', ROADMAP_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const weeks = data.weeksJson ? JSON.parse(data.weeksJson) : undefined;
      const user = data.userJson ? JSON.parse(data.userJson) : undefined;
      return { weeks, user };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Save roadmap data to Firestore
 */
export async function saveRoadmapToFirestore(weeks: WeekData[], user: UserProfile): Promise<void> {
  const path = `roadmaps/${ROADMAP_DOC_ID}`;
  try {
    const docRef = doc(db, 'roadmaps', ROADMAP_DOC_ID);
    const payload = {
      userId: auth.currentUser?.uid || 'anonymous_eren',
      weeksJson: JSON.stringify(weeks),
      userJson: JSON.stringify(user),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
