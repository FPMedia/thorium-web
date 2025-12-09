"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  QueryConstraint,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth/AuthContext";
import { Purchase, PurchaseStatus } from "@/types/purchase";

interface UsePurchasesOptions {
  orderByField?: "purchaseDate" | "createdAt";
  orderDirection?: "asc" | "desc";
  status?: PurchaseStatus;
}

/**
 * Custom hook to get real-time updates of user purchases
 */
export function usePurchases(options: UsePurchasesOptions = {}) {
  const { user, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    orderByField = "purchaseDate",
    orderDirection = "desc",
    status,
  } = options;

  useEffect(() => {
    // Don't subscribe if user is not authenticated or auth is still loading
    if (authLoading || !user) {
      setLoading(false);
      setPurchases([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const constraints: QueryConstraint[] = [
        where("userId", "==", user.uid),
      ];

      // Add status filter if provided (must come before orderBy)
      if (status) {
        constraints.push(where("status", "==", status));
      }

      // orderBy must come after all where clauses
      constraints.push(orderBy(orderByField, orderDirection));

      const q = query(collection(db, "purchases"), ...constraints);

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const purchasesData: Purchase[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Purchase[];

          setPurchases(purchasesData);
          setLoading(false);
        },
        (err) => {
          console.error("Error in purchases snapshot:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up purchases subscription:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user, authLoading, orderByField, orderDirection, status]);

  return {
    purchases,
    loading,
    error,
  };
}

/**
 * Hook to check if user owns a specific book
 */
export function useBookOwnership(bookId: string | null) {
  const { user, loading: authLoading } = useAuth();
  const [ownsBook, setOwnsBook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading || !user || !bookId) {
      setLoading(false);
      setOwnsBook(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const constraints: QueryConstraint[] = [
        where("userId", "==", user.uid),
        where("bookId", "==", bookId),
        where("status", "==", "completed"),
      ];

      const q = query(collection(db, "purchases"), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          setOwnsBook(!querySnapshot.empty);
          setLoading(false);
        },
        (err) => {
          console.error("Error checking book ownership:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up ownership check:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user, authLoading, bookId]);

  return {
    ownsBook,
    loading,
    error,
  };
}

