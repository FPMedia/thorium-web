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
    
    const manifestLink = new Link({ href: decodedUrl });
    const fetcher = new HttpFetcher(undefined);

    try {
      const fetched = fetcher.get(manifestLink);
      
      // Get self-link first
      fetched.link().then((link) => {
        setSelfLink(link.toURL(decodedUrl));
      });

      // Then get manifest data
      fetched.readAsJSON().then((manifestData) => {
        setManifest(manifestData as object);
        // Move to next phase when manifest is loaded
        dispatch(setLoadingPhase("initializing-publication"));
      }).catch((error) => {
        console.error("Error loading manifest:", error);
        setError(`Failed loading manifest ${ decodedUrl }: ${ error instanceof Error ? error.message : "Unknown error" }`);
      });
    } catch (error: unknown) {
      console.error("Error loading manifest:", error);
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
