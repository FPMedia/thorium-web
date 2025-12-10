import * as jose from "jose";
import { CreatePurchaseData, PurchaseStatus } from "@/types/purchase";

const PURCHASES_COLLECTION = "purchases";

// Service account credentials cached
let cachedServiceAccount: ServiceAccount | null = null;
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

interface ServiceAccount {
  project_id: string;
  private_key: string;
  client_email: string;
}

/**
 * Get the service account from environment variable
 */
function getServiceAccount(): ServiceAccount {
  if (cachedServiceAccount) {
    return cachedServiceAccount;
  }

  let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  // Handle cases where the JSON might be wrapped in quotes or double-encoded
  // Remove surrounding quotes if present
  serviceAccountJson = serviceAccountJson.trim();
  if (serviceAccountJson.startsWith('"') && serviceAccountJson.endsWith('"')) {
    serviceAccountJson = serviceAccountJson.slice(1, -1);
    // Unescape any escaped quotes
    serviceAccountJson = serviceAccountJson.replace(/\\"/g, '"');
  }

  // Fix newline characters in the JSON string
  // JSON doesn't allow unescaped control characters like newlines
  // Environment variables might contain literal newlines that need to be escaped
  // Strategy: temporarily replace already-escaped newlines, escape actual newlines, then restore
  // This prevents double-escaping of already-escaped sequences
  const ESCAPED_NEWLINE_PLACEHOLDER = '___ESCAPED_NEWLINE___';
  serviceAccountJson = serviceAccountJson
    // First, protect already-escaped newlines
    .replace(/\\n/g, ESCAPED_NEWLINE_PLACEHOLDER)
    // Then escape actual newline characters
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n')
    // Finally, restore the already-escaped ones
    .replace(new RegExp(ESCAPED_NEWLINE_PLACEHOLDER, 'g'), '\\n');

  try {
    cachedServiceAccount = JSON.parse(serviceAccountJson);
    
    // Validate required fields
    if (!cachedServiceAccount.project_id || !cachedServiceAccount.private_key || !cachedServiceAccount.client_email) {
      throw new Error("Service account JSON is missing required fields (project_id, private_key, or client_email)");
    }
    
    return cachedServiceAccount!;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", errorMessage);
    console.error("First 100 chars of key:", serviceAccountJson.substring(0, 100));
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON: ${errorMessage}`);
  }
}

/**
 * Generate a Google OAuth access token using the service account
 * This is needed to authenticate with Firestore REST API
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 300000) {
    return cachedAccessToken.token;
  }

  const serviceAccount = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  // Create a JWT to exchange for an access token
  const privateKey = await jose.importPKCS8(serviceAccount.private_key, "RS256");
  
  const jwt = await new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600) // 1 hour
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .sign(privateKey);

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Failed to get access token:", errorText);
    throw new Error("Failed to authenticate with Google");
  }

  const tokenData = await tokenResponse.json();
  
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in * 1000),
  };

  return cachedAccessToken.token;
}

/**
 * Get the Firestore base URL for REST API
 */
function getFirestoreBaseUrl(): string {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set");
  }
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

/**
 * Convert a Date to Firestore timestamp format
 */
function toFirestoreTimestamp(date: Date | any): { timestampValue: string } {
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (date && typeof date.toDate === "function") {
    dateObj = date.toDate();
  } else if (date && typeof date === "object" && date.seconds !== undefined) {
    dateObj = new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
  } else {
    dateObj = new Date();
  }
  
  return { timestampValue: dateObj.toISOString() };
}

/**
 * Convert JavaScript value to Firestore field value
 */
function toFirestoreValue(value: any): any {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === "string") {
    return { stringValue: value };
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }
    return { doubleValue: value };
  }
  if (typeof value === "boolean") {
    return { booleanValue: value };
  }
  if (value instanceof Date) {
    return toFirestoreTimestamp(value);
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === "object") {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

/**
 * Convert Firestore field value to JavaScript value
 */
function fromFirestoreValue(field: any): any {
  if (field.nullValue !== undefined) return null;
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.integerValue !== undefined) return parseInt(field.integerValue, 10);
  if (field.doubleValue !== undefined) return field.doubleValue;
  if (field.booleanValue !== undefined) return field.booleanValue;
  if (field.timestampValue !== undefined) return new Date(field.timestampValue);
  if (field.arrayValue !== undefined) {
    return (field.arrayValue.values || []).map(fromFirestoreValue);
  }
  if (field.mapValue !== undefined) {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(field.mapValue.fields || {})) {
      result[k] = fromFirestoreValue(v);
    }
    return result;
  }
  return null;
}

/**
 * Convert Firestore document to JavaScript object
 */
function fromFirestoreDocument(doc: any): any {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(doc.fields || {})) {
    result[key] = fromFirestoreValue(value);
  }
  return result;
}

/**
 * Create a new purchase record (server-side using Firestore REST API)
 * This bypasses security rules and should only be used in trusted server contexts
 * where the user has already been authenticated via token verification
 * 
 * @param purchaseData The purchase data to create
 * @param documentId Optional document ID to use (if not provided, Firestore will generate one)
 * @returns The document ID of the created purchase
 */
export async function createPurchaseServer(
  purchaseData: CreatePurchaseData,
  documentId?: string
): Promise<string> {
  try {
    const accessToken = await getAccessToken();
    const baseUrl = getFirestoreBaseUrl();
    const now = new Date();

    const fields: Record<string, any> = {
      userId: toFirestoreValue(purchaseData.userId),
      bookId: toFirestoreValue(purchaseData.bookId),
      bookTitle: toFirestoreValue(purchaseData.bookTitle),
      purchaseDate: toFirestoreTimestamp(purchaseData.purchaseDate),
      price: toFirestoreValue(purchaseData.price),
      currency: toFirestoreValue(purchaseData.currency),
      transactionId: toFirestoreValue(purchaseData.transactionId || null),
      paymentMethod: toFirestoreValue(purchaseData.paymentMethod),
      status: toFirestoreValue(purchaseData.status),
      createdAt: toFirestoreTimestamp(now),
      updatedAt: toFirestoreTimestamp(now),
    };

    let url: string;
    let method: string;

    if (documentId) {
      // Use PATCH with the document ID to create/update a specific document
      url = `${baseUrl}/${PURCHASES_COLLECTION}/${documentId}`;
      method = "PATCH";
    } else {
      // POST to collection to let Firestore generate an ID
      url = `${baseUrl}/${PURCHASES_COLLECTION}`;
      method = "POST";
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Firestore create error:", errorText);
      throw new Error(`Failed to create purchase: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract document ID from the response name
    // Format: projects/{project}/databases/(default)/documents/{collection}/{docId}
    const docPath = result.name || "";
    const docId = docPath.split("/").pop() || documentId || "";
    
    return docId;
  } catch (error) {
    console.error("Error creating purchase:", error);
    throw new Error("Failed to create purchase record");
  }
}

/**
 * Get a purchase by its ID (server-side using Firestore REST API)
 */
export async function getPurchaseByIdServer(purchaseId: string): Promise<any | null> {
  try {
    const accessToken = await getAccessToken();
    const baseUrl = getFirestoreBaseUrl();
    const url = `${baseUrl}/${PURCHASES_COLLECTION}/${purchaseId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Firestore get error:", errorText);
      throw new Error(`Failed to get purchase: ${response.status}`);
    }

    const doc = await response.json();
    
    return {
      id: purchaseId,
      ...fromFirestoreDocument(doc),
    };
  } catch (error) {
    // If it's a 404-type error, return null
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    console.error("Error getting purchase:", error);
    throw new Error("Failed to get purchase");
  }
}

/**
 * Update the status of a purchase (server-side using Firestore REST API)
 */
export async function updatePurchaseStatusServer(
  purchaseId: string,
  status: PurchaseStatus,
  transactionId?: string
): Promise<void> {
  try {
    const accessToken = await getAccessToken();
    const baseUrl = getFirestoreBaseUrl();
    const now = new Date();

    const fields: Record<string, any> = {
      status: toFirestoreValue(status),
      updatedAt: toFirestoreTimestamp(now),
    };

    if (transactionId) {
      fields.transactionId = toFirestoreValue(transactionId);
    }

    // Build updateMask for partial update
    const updateMask = Object.keys(fields).map(f => `updateMask.fieldPaths=${f}`).join("&");
    const url = `${baseUrl}/${PURCHASES_COLLECTION}/${purchaseId}?${updateMask}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Firestore update error:", errorText);
      throw new Error(`Failed to update purchase: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating purchase status:", error);
    throw new Error("Failed to update purchase status");
  }
}
