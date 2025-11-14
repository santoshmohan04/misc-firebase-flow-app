'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  // Connect to emulators if in development mode and emulators are enabled
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true' && !(auth as any)._isEmulated) {
      // Auth Emulator
      const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST;
      if (authHost) {
        try {
            connectAuthEmulator(auth, authHost, { disableWarnings: true });
            console.log(`Auth Emulator connected: ${authHost}`);
        } catch (e) {
            console.warn("Could not connect to Auth Emulator", e);
        }
      }

      // Firestore Emulator
      const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
      const firestorePort = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT;
      if (firestoreHost && firestorePort) {
        try {
            connectFirestoreEmulator(firestore, firestoreHost, parseInt(firestorePort));
            console.log(`Firestore Emulator connected: ${firestoreHost}:${firestorePort}`);
        } catch(e) {
            console.warn("Could not connect to Firestore Emulator", e);
        }
      }
      
      // Storage Emulator
      const storageHost = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST;
      const storagePort = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT;
      if (storageHost && storagePort) {
        try {
            connectStorageEmulator(storage, storageHost, parseInt(storagePort));
            console.log(`Storage Emulator connected: ${storageHost}:${storagePort}`);
        } catch(e) {
            console.warn("Could not connect to Storage Emulator", e);
        }
      }
  }
  
  return { firebaseApp: app, auth, firestore, storage };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './storage';
