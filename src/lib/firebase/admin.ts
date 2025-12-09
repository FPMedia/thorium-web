import * as jose from "jose";

// Firebase/Google public keys JWKS endpoint for ID token verification
const GOOGLE_JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

// Cache for JWKS to avoid fetching on every request
let jwksCache: jose.JWTVerifyGetKey | null = null;

/**
 * Get the JWKS verification function (cached)
 */
async function getJWKS(): Promise<jose.JWTVerifyGetKey> {
  if (!jwksCache) {
    jwksCache = jose.createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
  }
  return jwksCache;
}

export interface DecodedIdToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: any;
}

/**
 * Verify Firebase ID token using jose (edge-compatible)
 * 
 * Firebase ID tokens are JWTs signed by Google. We verify them by:
 * 1. Fetching Google's public keys from their JWKS endpoint
 * 2. Verifying the JWT signature
 * 3. Checking the audience (Firebase project ID) and issuer
 */
export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set");
  }

  try {
    const jwks = await getJWKS();
    
    const { payload } = await jose.jwtVerify(token, jwks, {
      // Firebase ID tokens use the project ID as the audience
      audience: projectId,
      // Firebase ID tokens are issued by securetoken.google.com/<project-id>
      issuer: `https://securetoken.google.com/${projectId}`,
    });

    // Extract user ID from the 'sub' claim (subject = Firebase UID)
    const uid = payload.sub;
    
    if (!uid) {
      throw new Error("Token does not contain a valid user ID (sub claim)");
    }

    return {
      ...payload,
      uid,
      email: payload.email as string | undefined,
      email_verified: payload.email_verified as boolean | undefined,
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    
    if (error instanceof jose.errors.JWTExpired) {
      throw new Error("Token has expired");
    }
    if (error instanceof jose.errors.JWTClaimValidationFailed) {
      throw new Error("Token validation failed: invalid claims");
    }
    if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
      throw new Error("Token verification failed: invalid signature");
    }
    
    throw new Error("Token verification failed");
  }
}
