import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

let dbInstance: Firestore | null = null;

export function getDb(): Firestore {
  if (typeof window === "undefined") {
    return getFirestore(getFirebaseApp());
  }
  if (!dbInstance) {
    const app = getFirebaseApp();
    try {
      dbInstance = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      dbInstance = getFirestore(app);
    }
  }
  return dbInstance;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

// Convenience re-exports for files that import `db` and `auth` directly
export const db = (() => {
  if (typeof window === "undefined") return null as unknown as Firestore;
  return getDb();
})();

export const auth = (() => {
  if (typeof window === "undefined") return null as unknown as Auth;
  return getFirebaseAuth();
})();

export default getFirebaseApp;
