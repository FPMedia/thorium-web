"use client";

import { useEffect } from "react";

export function ErrorHandler() {
  useEffect(() => {
    // Suppress filesystem errors that are non-critical
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(" ");
      // Suppress filesystem-related errors that are likely from libraries
      if (message.includes("Unable to add filesystem") && message.includes("illegal path")) {
        // Silently ignore - this is likely from a library trying to use File System Access API
        return;
      }
      originalError.apply(console, args);
    };

    // Handle unhandled promise rejections related to filesystem
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || "";
      if (reason.includes("filesystem") && reason.includes("illegal path")) {
        event.preventDefault();
        // Silently ignore
        return;
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      console.error = originalError;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}

