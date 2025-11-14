'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import type { useToast } from "@/hooks/use-toast";

type ToastFunction = ReturnType<typeof useToast>['toast'];

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, toast: ToastFunction): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
        console.error("Sign up error:", error);
        toast({
            title: "Sign-up Failed",
            description: error.message,
            variant: "destructive"
        });
    });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, toast: ToastFunction): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
        console.error("Sign in error:", error);
        toast({
            title: "Sign-in Failed",
            description: error.message,
            variant: "destructive"
        });
    });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
