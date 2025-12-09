"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatefulReader } from "@/components/Epub";
import { StatefulLoader } from "@/components/StatefulLoader";
import { PUBLICATION_MANIFESTS } from "@/config/publications";
import { usePublication } from "@/hooks/usePublication";
import { useAppSelector } from "@/lib/hooks";
import { verifyManifestUrl } from "@/app/api/verify-manifest/verifyDomain";
import { useBookOwnership } from "@/hooks/usePurchases";
import { getBookIdFromRouteIdentifier } from "@/config/books";
import { useAuth } from "@/lib/auth/AuthContext";
import Link from "next/link";

import "@/app/app.css";

type Params = { identifier: string };

type Props = {
  params: Promise<Params>;
};

export default function BookPage({ params }: Props) {
  const [domainError, setDomainError] = useState<string | null>(null);
  const identifier = use(params).identifier;
  const isLoading = useAppSelector(state => state.reader.isLoading);
  const manifestUrl = identifier ? PUBLICATION_MANIFESTS[identifier as keyof typeof PUBLICATION_MANIFESTS] : "";
  const { user, loading: authLoading } = useAuth();
  
  // Get book ID from route identifier
  const bookId = identifier ? (getBookIdFromRouteIdentifier(identifier) ?? null) : null;
  const { ownsBook, loading: ownershipLoading } = useBookOwnership(bookId);

  useEffect(() => {
    if (manifestUrl) {
      verifyManifestUrl(manifestUrl).then(allowed => {
        if (!allowed) {
          setDomainError(`Domain not allowed: ${ new URL(manifestUrl).hostname }`);
        }
      });
    }
  }, [manifestUrl]);

  const { error, manifest, selfLink } = usePublication({
    url: manifestUrl,
    onError: (error) => {
      console.error("Publication loading error:", error);
    }
  });

  // Check ownership if bookId exists (purchasable book)
  if (bookId && !authLoading && !ownershipLoading && user) {
    if (!ownsBook) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Purchase Required
            </h1>
            <p className="text-gray-600 mb-6">
              You need to purchase this book to access it.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-md hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Back to Home
            </Link>
          </div>
        </div>
      );
    }
  }

  if (domainError) {
    return (
      <div className="container">
        <h1>Access Denied</h1>
        <p>{ domainError }</p>
      </div>
    );
  }

  return (
    <>
      { error ? (
        <div className="container">
          <h1>Error</h1>
          <p>{ error }</p>
        </div>
      ) : (
        <StatefulLoader isLoading={ isLoading }>
          { manifest && selfLink && <StatefulReader rawManifest={ manifest } selfHref={ selfLink } /> }
        </StatefulLoader>
      )}
    </>
  );
}
