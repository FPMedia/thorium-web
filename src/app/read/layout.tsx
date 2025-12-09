"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

/**
 * Reader Layout
 * 
 * This layout is used for the eReader pages (/read/*).
 * It does NOT include the custom Navigation and ScrollToTop components,
 * allowing the Thorium eReader's native UI (settings, TOC, themes, etc.) to work.
 */
export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="reader-layout">
        {children}
      </div>
    </ProtectedRoute>
  );
}
