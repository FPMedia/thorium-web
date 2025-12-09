"use client";

import { useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateCookie = async (user: User | null) => {
      if (user) {
        try {
          // Get fresh token (Firebase handles refresh automatically)
          const token = await user.getIdToken();
          // Set cookie with 1 hour expiration (Firebase tokens last ~1 hour)
          // Note: Secure flag removed for development compatibility
          const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
          document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax${isSecure ? "; Secure" : ""}`;
        } catch (error) {
          console.error("Error updating auth cookie:", error);
        }
      } else {
        document.cookie = `__session=; path=/; max-age=0`;
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      await updateCookie(user);
    });

    // Set up token refresh listener to keep cookie updated
    const refreshInterval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          // Force token refresh
          const token = await auth.currentUser.getIdToken(true);
          const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
          document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax${isSecure ? "; Secure" : ""}`;
        } catch (error) {
          console.error("Error refreshing auth token:", error);
        }
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes (tokens last ~1 hour)

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

