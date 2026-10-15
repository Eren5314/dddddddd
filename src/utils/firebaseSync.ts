import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
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
const SHARED_USER_ID = 'eren_shared_roadmap';

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
 * Subscribe to real-time changes from Firestore.
 * When an authorized person adds or edits tasks, Drive links, or resources,
 * all connected visitors immediately receive the updates in real time!
 */
export function subscribeToRoadmap(
  onData: (data: { weeks: WeekData[]; user?: UserProfile }) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `roadmaps/${ROADMAP_DOC_ID}`;
  const docRef = doc(db, 'roadmaps', ROADMAP_DOC_ID);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        try {
          const data = snapshot.data();
          const weeks: WeekData[] = data.weeksJson ? JSON.parse(data.weeksJson) : [];
          const user: UserProfile | undefined = data.userJson ? JSON.parse(data.userJson) : undefined;
          if (Array.isArray(weeks) && weeks.length > 0) {
            onData({ weeks, user });
          }
        } catch (e) {
          console.error('Error parsing snapshot data:', e);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

/**
 * Load roadmap data once from Firestore
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
 * Save roadmap data to Firestore.
 * Guarded to ensure valid weeks data is saved.
 */
export async function saveRoadmapToFirestore(weeks: WeekData[], user: UserProfile): Promise<boolean> {
  if (!weeks || !Array.isArray(weeks) || weeks.length === 0) {
    console.warn('Skipping save: weeks is empty');
    return false;
  }

  const path = `roadmaps/${ROADMAP_DOC_ID}`;
  try {
    const docRef = doc(db, 'roadmaps', ROADMAP_DOC_ID);
    const payload = {
      userId: SHARED_USER_ID,
      weeksJson: JSON.stringify(weeks),
      userJson: JSON.stringify(user),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}
