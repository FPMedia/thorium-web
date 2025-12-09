import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp,
  orderBy,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import { Purchase, CreatePurchaseData, PurchaseStatus } from "@/types/purchase";

const PURCHASES_COLLECTION = "purchases";

/**
 * Convert a Date to a Firestore Timestamp
 */
function toTimestamp(date: Date | Timestamp): Timestamp {
  if (date instanceof Timestamp) {
    return date;
  }
  return Timestamp.fromDate(date);
}

/**
 * Create a new purchase record
 */
export async function createPurchase(
  purchaseData: CreatePurchaseData
): Promise<string> {
  try {
    const now = Timestamp.now();
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

    const docRef = await addDoc(collection(db, PURCHASES_COLLECTION), purchaseDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error creating purchase:", error);
    throw new Error("Failed to create purchase record");
  }
}

/**
 * Get a purchase by its ID
 */
export async function getPurchaseById(purchaseId: string): Promise<Purchase | null> {
  try {
    const docRef = doc(db, PURCHASES_COLLECTION, purchaseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Purchase;
  } catch (error) {
    console.error("Error getting purchase:", error);
    throw new Error("Failed to get purchase");
  }
}

/**
 * Get all purchases for a specific user
 */
export async function getUserPurchases(
  userId: string,
  orderByField: "purchaseDate" | "createdAt" = "purchaseDate",
  orderDirection: "asc" | "desc" = "desc"
): Promise<Purchase[]> {
  try {
    const constraints: QueryConstraint[] = [
      where("userId", "==", userId),
      orderBy(orderByField, orderDirection),
    ];

    const q = query(collection(db, PURCHASES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Purchase[];
  } catch (error) {
    console.error("Error getting user purchases:", error);
    throw new Error("Failed to get user purchases");
  }
}

/**
 * Get purchases for a specific book by a user
 */
export async function getPurchasesByBookId(
  userId: string,
  bookId: string
): Promise<Purchase[]> {
  try {
    const constraints: QueryConstraint[] = [
      where("userId", "==", userId),
      where("bookId", "==", bookId),
      orderBy("purchaseDate", "desc"),
    ];

    const q = query(collection(db, PURCHASES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Purchase[];
  } catch (error) {
    console.error("Error getting purchases by book ID:", error);
    throw new Error("Failed to get purchases by book ID");
  }
}

/**
 * Check if a user owns a specific book (has at least one completed purchase)
 */
export async function userOwnsBook(
  userId: string,
  bookId: string
): Promise<boolean> {
  try {
    const constraints: QueryConstraint[] = [
      where("userId", "==", userId),
      where("bookId", "==", bookId),
      where("status", "==", "completed"),
    ];

    const q = query(collection(db, PURCHASES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking book ownership:", error);
    throw new Error("Failed to check book ownership");
  }
}

/**
 * Update the status of a purchase
 */
export async function updatePurchaseStatus(
  purchaseId: string,
  status: PurchaseStatus,
  transactionId?: string
): Promise<void> {
  try {
    const docRef = doc(db, PURCHASES_COLLECTION, purchaseId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };
    
    if (transactionId) {
      updateData.transactionId = transactionId;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating purchase status:", error);
    throw new Error("Failed to update purchase status");
  }
}

