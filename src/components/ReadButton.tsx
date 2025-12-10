"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { setLoading, setLoadingPhase } from "@/lib/readerReducer";

interface ReadButtonProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}

export function ReadButton({ 
  href, 
  children = "Read Now",
  className = "",
  variant = "primary"
}: ReadButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (isNavigating) return;
    
    // Immediately show feedback
    setIsNavigating(true);
    
    // Set loading state immediately (async to not block UI)
    setTimeout(() => {
      dispatch(setLoading(true));
      dispatch(setLoadingPhase("fetching-manifest"));
    }, 0);
    
    // Navigate
    router.push(href);
  };

  const baseClasses = "inline-flex items-center justify-center px-5 py-2 font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variantClasses = variant === "primary"
    ? "bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500"
    : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500";

  return (
    <button
      onClick={handleClick}
      disabled={isNavigating}
      className={`${baseClasses} ${variantClasses} ${className}`}
      aria-busy={isNavigating}
    >
      {isNavigating ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {children}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 ml-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </>
      )}
    </button>
  );
}

