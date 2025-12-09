"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  useEffect(() => {
    // Get purchase ID from query params if available
    const mPaymentId = searchParams.get("m_payment_id");
    if (mPaymentId) {
      setPurchaseId(mPaymentId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your book is now available in your library.
        </p>

        {purchaseId && (
          <p className="text-sm text-gray-500 mb-6">
            Order ID: {purchaseId}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-md hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Back to Home
          </Link>
          {user && (
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-cyan-600 text-cyan-600 font-medium rounded-md hover:bg-cyan-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              View My Books
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

