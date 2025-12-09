"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useBookOwnership } from "@/hooks/usePurchases";
import { getBookById } from "@/config/books";

interface PurchaseButtonProps {
  bookId: string;
  className?: string;
}

export function PurchaseButton({ bookId, className = "" }: PurchaseButtonProps) {
  const { user } = useAuth();
  const { ownsBook, loading: ownershipLoading } = useBookOwnership(bookId);
  const [isProcessing, setIsProcessing] = useState(false);
  const book = getBookById(bookId);

  // Don't show button if user is not authenticated
  if (!user) {
    return null;
  }

  // Don't show button if book not found
  if (!book) {
    return null;
  }

  // Show loading state
  if (ownershipLoading) {
    return (
      <button
        disabled
        className={`px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed ${className}`}
      >
        Loading...
      </button>
    );
  }

  // Show owned state
  if (ownsBook) {
    return (
      <span
        className={`inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md ${className}`}
      >
        <svg
          className="w-4 h-4 mr-2"
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
        Owned
      </span>
    );
  }

  // Handle purchase click
  const handlePurchase = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Call API to initiate payment
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        let errorMessage = "Failed to initiate payment";
        if (isJson) {
          try {
            const error = await response.json();
            errorMessage = error.message || error.error || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
        } else {
          // If not JSON, it's probably an HTML error page
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error("Server returned invalid response format");
      }

      const { paymentData, paymentUrl } = await response.json();

      // Create a form and submit it to redirect to Payfast
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;

      // Add all payment data as hidden inputs
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={isProcessing}
      className={`px-6 py-2 bg-cyan-600 text-white font-medium rounded-md hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {isProcessing ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        `Purchase - R${book.price.toFixed(2)}`
      )}
    </button>
  );
}

