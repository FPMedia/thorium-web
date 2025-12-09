import { Timestamp } from "firebase/firestore";

export type PurchaseStatus = "completed" | "pending" | "refunded" | "failed";

export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  purchaseDate: Timestamp;
  price: number;
  currency: string;
  transactionId?: string;
  paymentMethod: string;
  status: PurchaseStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreatePurchaseData {
  userId: string;
  bookId: string;
  bookTitle: string;
  purchaseDate: Date | Timestamp;
  price: number;
  currency: string;
  transactionId?: string;
  paymentMethod: string;
  status: PurchaseStatus;
}

