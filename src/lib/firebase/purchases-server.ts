import { admin } from "@/lib/firebase/admin";
import { CreatePurchaseData, PurchaseStatus } from "@/types/purchase";

const PURCHASES_COLLECTION = "purchases";

// Get Firestore instance from admin
const db = admin.firestore();

/**
 * Convert a Date to a Firestore Timestamp
 */
function toTimestamp(date: Date | any): any {
  // If it's already a Firestore Timestamp from admin SDK
  if (date && typeof date.toDate === "function") {
    return date;
  }
  // If it's a Date object
  if (date instanceof Date) {
    return admin.firestore.Timestamp.fromDate(date);
  }
  // If it's a Firestore Timestamp from client SDK (has seconds property)
  if (date && typeof date === "object" && date.seconds !== undefined) {
    return admin.firestore.Timestamp.fromMillis(
      date.seconds * 1000 + (date.nanoseconds || 0) / 1000000
    );
  }
  // Default to now
  return admin.firestore.Timestamp.now();
}

/**
 * Create a new purchase record (server-side using Admin SDK)
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
    const now = admin.firestore.Timestamp.now();
    const purchaseDoc = {
      userId: purchaseData.userId,
      bookId: purchaseData.bookId,
      bookTitle: purchaseData.bookTitle,
      purchaseDate: toTimestamp(purchaseData.purchaseDate),
      price: purchaseData.price,
      currency: purchaseData.currency,
      transactionId: purchaseData.transactionId || null,
      paymentMethod: purchaseData.paymentMethod,
      status: purchaseData.status,
      createdAt: now,
      updatedAt: now,
    };

    if (documentId) {
      // Use the provided document ID (e.g., from PayFast m_payment_id)
      await db.collection(PURCHASES_COLLECTION).doc(documentId).set(purchaseDoc);
      return documentId;
    } else {
      // Let Firestore generate the ID
      const docRef = await db.collection(PURCHASES_COLLECTION).add(purchaseDoc);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error creating purchase:", error);
    throw new Error("Failed to create purchase record");
  }
}

/**
 * Get a purchase by its ID (server-side using Admin SDK)
 */
export async function getPurchaseByIdServer(purchaseId: string): Promise<any | null> {
  try {
    const docRef = db.collection(PURCHASES_COLLECTION).doc(purchaseId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error getting purchase:", error);
    throw new Error("Failed to get purchase");
  }
}

/**
 * Update the status of a purchase (server-side using Admin SDK)
 */
export async function updatePurchaseStatusServer(
  purchaseId: string,
  status: PurchaseStatus,
  transactionId?: string
): Promise<void> {
  try {
    const docRef = db.collection(PURCHASES_COLLECTION).doc(purchaseId);
    const updateData: any = {
      status,
      updatedAt: admin.firestore.Timestamp.now(),
    };
    
    if (transactionId) {
      updateData.transactionId = transactionId;
    }
    
    await docRef.update(updateData);
  } catch (error) {
    console.error("Error updating purchase status:", error);
    throw new Error("Failed to update purchase status");
  }
}

