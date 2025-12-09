import admin from "firebase-admin";
import path from "path";
import { existsSync } from "fs";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Try to initialize with application default credentials first
  // This works on Google Cloud Platform (Cloud Run, Cloud Functions, etc.)
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    // If application default credentials are not available,
    // try to use service account from environment variable or file
    let serviceAccount;
    
    // Option 1: Service account JSON as string in environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (parseError) {
        console.warn("Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
      }
    }
    
    // Option 2: Service account file path from environment variable
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      try {
        const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        if (existsSync(serviceAccountPath)) {
          serviceAccount = require(serviceAccountPath);
        }
      } catch (fileError) {
        console.warn("Firebase Admin: Failed to load service account from file path");
      }
    }
    
    // Option 3: Default file locations (for local development)
    // Try common service account key filenames in the firebase folder
    if (!serviceAccount) {
      const firebaseDir = path.resolve(process.cwd(), "firebase");
      const possibleFiles = [
        "nicole-barlow-firebase-adminsdk-fbsvc-ce4f658996.json", // Your specific key file
        "firebase-service-account.json", // Generic default name
      ];
      
      for (const filename of possibleFiles) {
        try {
          const filePath = path.join(firebaseDir, filename);
          if (existsSync(filePath)) {
            serviceAccount = require(filePath);
            break; // Found a valid file, stop searching
          }
        } catch (fileError) {
          // Continue to next file
        }
      }
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback to project ID only (for local development with emulator)
      console.warn("Firebase Admin: No service account found, using project ID only");
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }
}

export interface DecodedIdToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: any;
}

/**
 * Verify Firebase ID token using Firebase Admin SDK
 */
export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      ...decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified || false,
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error("Token verification failed");
  }
}

// Export admin for use in other server-side code
export { admin };

