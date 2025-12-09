"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <ScrollToTop />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navigation />
      <ScrollToTop />
      <main className="min-h-screen pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-8">
            Your Profile
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              {user.displayName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <p className="text-gray-900">{user.displayName}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Created
                </label>
                <p className="text-gray-900">
                  {user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Actions</h2>
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-cyan-600 text-white font-medium rounded-full hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer"
              >
                Browse Books
              </Link>
              <button
                onClick={handleSignOut}
                className="block mt-4 px-6 py-3 border-2 border-red-600 text-red-600 font-medium rounded-full hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

