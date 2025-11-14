'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANT: This function initializes a connection to live Firebase services.
// Do NOT add any emulator connection logic (e.g., connectAuthEmulator).
// The development environment is configured to work with live services.
export function initializeFirebase() {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  
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
