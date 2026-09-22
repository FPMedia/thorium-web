"use client";

import { useState, useEffect, ReactNode } from "react";
import { User, onIdTokenChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { AuthContext } from "./AuthContext";
import { clearSessionCookie, persistSessionCookie } from "./sessionCookie";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      try {
        if (nextUser) {
          const token = await nextUser.getIdToken();
          await persistSessionCookie(token);
        } else {
          await clearSessionCookie();
        }
      } catch (error) {
        console.error("Error updating auth session:", error);
      }

      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdToken();
    await persistSessionCookie(token);
  };

  const signUp = async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdToken();
    await persistSessionCookie(token);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    await clearSessionCookie();
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
