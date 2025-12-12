"use client";

import { useEffect, useState } from "react";
import { Link } from "@readium/shared";
import { HttpFetcher } from "@readium/shared";
import { useAppDispatch } from "@/lib/hooks";
import { setLoadingPhase } from "@/lib/readerReducer";

export interface UsePublicationOptions {
  url: string;
  onError?: (error: string) => void;
}

export const usePublication = ({ 
  url, 
  onError = () => {} 
}: UsePublicationOptions) => {
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [manifest, setManifest] = useState<object | undefined>(undefined);
  const [selfLink, setSelfLink] = useState<string | undefined>(undefined);

  // Basic URL validation and loading
  useEffect(() => {
    if (!url) {
      setError("Manifest URL is required");
      return;
    }

    // Set loading phase to fetching manifest
    dispatch(setLoadingPhase("fetching-manifest"));

    // Decode URL if needed
    const decodedUrl = decodeURIComponent(url);
    console.log("[usePublication] Fetching manifest from:", decodedUrl);
    
    // Add cache-busting query parameter to prevent stale manifest caching on mobile/desktop
    // This ensures fresh fetches while preserving the original URL for selfLink
    let cacheBustedUrl: string;
    try {
      const urlObj = new URL(decodedUrl);
      const cacheBuster = `_t=${Date.now()}`;
      if (urlObj.search) {
        urlObj.search += `&${cacheBuster}`;
      } else {
        urlObj.search = `?${cacheBuster}`;
      }
      cacheBustedUrl = urlObj.toString();
      console.log("[usePublication] Using cache-busted URL:", cacheBustedUrl);
    } catch (urlError) {
      // If URL parsing fails, fallback to appending query string directly
      console.warn("[usePublication] Failed to parse URL, using fallback cache-busting:", urlError);
      const separator = decodedUrl.includes("?") ? "&" : "?";
      cacheBustedUrl = `${decodedUrl}${separator}_t=${Date.now()}`;
      console.log("[usePublication] Using cache-busted URL (fallback):", cacheBustedUrl);
    }
    
    const manifestLink = new Link({ href: cacheBustedUrl });
    const fetcher = new HttpFetcher(undefined);

    console.log("[usePublication] Starting manifest fetch...");
    
    try {
      const fetched = fetcher.get(manifestLink);
      
      // Get self-link first - use original URL without cache buster for selfLink
      fetched.link().then((link) => {
        const selfLinkUrl = link.toURL(decodedUrl);
        console.log("[usePublication] SelfLink resolved:", selfLinkUrl);
        setSelfLink(selfLinkUrl);
      }).catch((linkError) => {
        console.warn("[usePublication] SelfLink resolution failed, using fallback:", linkError);
        // Fallback to using the manifest URL itself as selfLink (without cache buster)
        setSelfLink(decodedUrl);
      });

      // Then get manifest data
      fetched.readAsJSON().then((manifestData) => {
        console.log("[usePublication] Manifest loaded successfully");
        setManifest(manifestData as object);
        // Move to next phase when manifest is loaded
        dispatch(setLoadingPhase("initializing-publication"));
      }).catch((error) => {
        console.error("[usePublication] Error loading manifest:", error);
        setError(`Failed loading manifest ${ decodedUrl }: ${ error instanceof Error ? error.message : "Unknown error" }`);
      });
    } catch (error: unknown) {
      console.error("[usePublication] Error loading manifest:", error);
      setError(`Failed loading manifest ${ decodedUrl }: ${ error instanceof Error ? error.message : "Unknown error" }`);
    }
  }, [url, dispatch]);

  // Call onError callback when error changes
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  return {
    error,
    manifest,
    selfLink
  };
}
