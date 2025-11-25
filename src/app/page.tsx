"use client";

import { useEffect, useState } from "react";
import { PublicationGrid, type Publication } from "@/components/PublicationGrid";
import Image from "next/image";

import { isManifestRouteEnabled } from "./ManifestRouteEnabled";

import "./home.css";

const books = [
  {
    title: "Hani's Assassin",
    author: "Nicole Barlow",
    cover: "/images/HanisAssassin.svg",
    url: "/read/hanis-assassin",
    rendition: "Reflowable EPUB"
  }
];

const onlineBooks: Publication[] = [

];

const webPublications: Publication[] = [

];

export default function Home() {
  const [isManifestEnabled, setIsManifestEnabled] = useState<boolean>(true);

  useEffect(() => {
    const checkManifestRoute = async () => {
      try {
        const enabled = await isManifestRouteEnabled();
        setIsManifestEnabled(enabled);
      } catch (error) {
        console.error("Error checking manifest route:", error);
        setIsManifestEnabled(false);
      }
    };

    checkManifestRoute();
  }, []);

  return (
    <main id="home">
      <header className="header">
        <h1>Nicole Barlow Publications</h1>


      </header>

      <PublicationGrid
        publications={[...books, ...webPublications]}
        renderCover={(publication) => (
          <Image
            src={publication.cover}
            alt=""
            loading="lazy"
            width={120}
            height={180}
          />
        )}
      />

      {isManifestEnabled && (
        <>
          <div className="dev-books">

            <PublicationGrid
              publications={onlineBooks}
              renderCover={(publication) => (
                <Image
                  src={publication.cover}
                  alt=""
                  loading="lazy"
                  width={120}
                  height={180}
                />
              )}
            />
          </div>
        </>
      )}
    </main>
  );
}
