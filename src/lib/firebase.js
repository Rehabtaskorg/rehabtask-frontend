import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * @returns {import("firebase/auth").Auth}
 */
export function getFirebaseAuth() {
    const app = getApps().length
        ? getApp()
        : initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });

    const auth = getAuth(app);
    auth.tenantId = process.env.NEXT_PUBLIC_IDENTITY_PLATFORM_TENANT_ID || null;
    return auth;
}