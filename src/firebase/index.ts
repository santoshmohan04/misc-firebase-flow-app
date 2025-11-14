'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// A function that grabs the emulator host from environment variables
// and returns it, or undefined if it's not set.
function getEmulatorHost(service: 'auth' | 'firestore' | 'storage'): string | undefined {
  switch (service) {
    case 'auth':
      return process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST;
    case 'firestore':
      return process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
    case 'storage':
        return process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST;
    default:
      return undefined;
  }
}

// A function that grabs the emulator port from environment variables
// and returns it as a number, or undefined if it's not set.
function getEmulatorPort(service: 'firestore' | 'storage'): number | undefined {
  const portString = service === 'firestore' 
    ? process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT 
    : process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT;

  return portString ? parseInt(portString, 10) : undefined;
}


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
      const authHost = getEmulatorHost('auth');
      if (authHost) {
        try {
            connectAuthEmulator(auth, authHost, { disableWarnings: true });
            console.log("Auth Emulator connected");
        } catch (e) {
            console.warn("Could not connect to Auth Emulator", e);
        }
      }

      // Firestore Emulator
      const firestoreHost = getEmulatorHost('firestore');
      const firestorePort = getEmulatorPort('firestore');
      if (firestoreHost && firestorePort) {
        try {
            connectFirestoreEmulator(firestore, firestoreHost, firestorePort);
            console.log("Firestore Emulator connected");
        } catch(e) {
            console.warn("Could not connect to Firestore Emulator", e);
        }
      }
      
      // Storage Emulator
      const storageHost = getEmulatorHost('storage');
      const storagePort = getEmulatorPort('storage');
      if (storageHost && storagePort) {
        try {
            connectStorageEmulator(storage, storageHost, storagePort);
            console.log("Storage Emulator connected");
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
