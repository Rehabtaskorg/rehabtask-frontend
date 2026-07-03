import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const baseAuth = getAuth(app);
baseAuth.tenantId = process.env.NEXT_PUBLIC_IDENTITY_PLATFORM_TENANT_ID || null;

/**
 * Firebase Auth instance scoped to the Identity Platform tenant.
 * Use this for all client-side auth operations: applyActionCode,
 * confirmPasswordReset, signInWithEmailLink, etc.
 *
 * @type {import("firebase/auth").Auth}
 */
export const firebaseAuth = baseAuth;