"use client";

import { use, useEffect, useState } from "react";
import { StatefulReader } from "@/components/Epub";
import { StatefulLoader } from "@/components/StatefulLoader";
import { usePublication } from "@/hooks/usePublication";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { setLoading, setLoadingPhase } from "@/lib/readerReducer";
import { verifyManifestUrl } from "@/app/api/verify-manifest/verifyDomain";

import "@/app/app.css";

type Params = { manifest: string };

type Props = {
  params: Promise<Params>;
};

export default function ManifestPage({ params }: Props) {
  const dispatch = useAppDispatch();
  const [domainError, setDomainError] = useState<string | null>(null);
  const isLoading = useAppSelector(state => state.reader.isLoading);
  const manifestUrl = use(params).manifest;

  // Reset loading state when manifest URL changes
  useEffect(() => {
    dispatch(setLoading(true));
    dispatch(setLoadingPhase("fetching-manifest"));
  }, [manifestUrl, dispatch]);

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
      console.error("Manifest loading error:", error);
    }
  });

  if (domainError) {
    return (
      <div className="container">
        <h1>Access Denied</h1>
        <p>{ domainError }</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Error</h1>
        <p>{ error }</p>
      </div>
    );
  }

  return (
    <StatefulLoader isLoading={ isLoading }>
      { manifest && selfLink && <StatefulReader rawManifest={ manifest } selfHref={ selfLink } /> }
    </StatefulLoader>
  );
}
