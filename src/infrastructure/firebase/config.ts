import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Check if Firebase is configured with valid credentials
 */
const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY !== 'your_api_key_here' &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  );
};

/**
 * Firebase configuration from environment variables
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize Firebase app
 * Ensures only one instance is created
 * Only initializes if valid credentials are provided
 */
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

export const initializeFirebase = (): void => {
  // Only initialize if Firebase is properly configured
  if (!isFirebaseConfigured()) {
    console.log('📱 Running in DEMO MODE - Firebase not configured');
    console.log('💡 To connect Firebase, follow QUICKSTART.md');
    return;
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  }
};

/**
 * Get Firebase services (returns null if not configured)
 */
export const getFirebaseAuth = (): Auth | null => {
  if (!auth && isFirebaseConfigured()) {
    initializeFirebase();
  }
  return auth;
};

export const getFirebaseFirestore = (): Firestore | null => {
  if (!firestore && isFirebaseConfigured()) {
    initializeFirebase();
  }
  return firestore;
};

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!app && isFirebaseConfigured()) {
    initializeFirebase();
  }
  return app;
};

export const isUsingFirebase = (): boolean => {
  return isFirebaseConfigured();
};

