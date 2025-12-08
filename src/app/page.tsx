"use client";

import { useEffect, useState } from "react";
import { PublicationGrid, type Publication } from "@/components/PublicationGrid";
import { Navigation } from "@/components/Navigation";
import { ScrollToTop } from "@/components/ScrollToTop";
import Image from "next/image";

import { isManifestRouteEnabled } from "./ManifestRouteEnabled";

const books = [
  {
    title: "Hani's Assassin",
    author: "Nicole Barlow",
    cover: "/images/cover-hanis-assassin.jpg",
    url: "/read/hanis-assassin",
    description: "Who killed Chris Hani? The convicted perpetrators were Janusz Waluś and right-wing sympathiser Clive Derby-Lewis, who both claimed during their trial and before the Truth and Reconciliation Commission that they acted alone. However, there have long been suspicions of other sinister influences and the possibility that a foreign power manipulated them. Nicole Barlow delves deeply into these suspicions and uncovers some startling revelations, prompted by an anonymous phone call from a whistleblower with insider knowledge. This fast-paced narrative explores not only the assassination itself, which brought South Africa to the brink of civil war, but also the peculiar reluctance of the South African security services to investigate thoroughly. Essential reading for those interested in South Africa's history and the roots of corruption."
  },
  {
    title: "Fuelling Environmental Corruption",
    author: "Nicole Barlow",
    cover: "/images/cover-fuelling-environmental-corruption.JPG",
    url: "/read/fuelling-environmental-corruption",
    description: "Her exploits earned her the moniker 'the Brockovich of Boksburg' by the Mail and Guardian. This memoir chronicles Nicole's 18-year struggle to expose the corrupt relationship between officials at the former Gauteng Department of Agriculture, Conservation and Environment (GDACE), and the developers of a British Petroleum fuel station. It demonstrates how such corruption devastates the environment, contaminates water resources, and destroys lives. The book reveals a broader spectrum of criminal activities, including bribery, secret meetings, court battles, arson and even murder."
  }
];

const onlineBooks: Publication[] = [];

const webPublications: Publication[] = [];

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
    <>
      {/* Custom Navigation - only on home page, not in eReader */}
      <Navigation />
      <ScrollToTop />
      
      <main className="min-h-screen">
        {/* Hero Section */}
      <header className="pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-24 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Nicole Barlow <em>Publications</em>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Investigative journalism and thought-provoking narratives. 
            Read Nicole Barlow's published works directly in your browser.
          </p>
        </div>
      </header>

      {/* Books Section */}
      <section id="books" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2 text-center">
            Available Books
          </h2>
          <p className="text-gray-600 text-center mb-8 sm:mb-12">
            Click on a book to start reading
          </p>
          
          <PublicationGrid
            publications={[...books, ...webPublications]}
            renderCover={(publication) => (
              <Image
                src={publication.cover}
                alt=""
                loading="lazy"
                width={120}
                height={180}
                className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              />
            )}
          />
        </div>
      </section>

      {/* Online Books Section (dev) */}
      {isManifestEnabled && onlineBooks.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8 text-center">
              Online Publications
            </h2>
            
            <PublicationGrid
              publications={onlineBooks}
              renderCover={(publication) => (
                <Image
                  src={publication.cover}
                  alt=""
                  loading="lazy"
                  width={120}
                  height={180}
                  className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                />
              )}
            />
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">
            About the Author
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
            Nicole Barlow is South Africa's foremost independent investigative journalist, 
            known for her fearless reporting and dedication to uncovering the truth. 
            Her published works reflect years of meticulous research and a commitment 
            to holding power accountable.
          </p>
          <a
            href="https://nicolebarlow.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-medium rounded-full hover:bg-cyan-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Visit Main Website
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
        </div>
      </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Nicole Barlow. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Powered by Thorium Reader
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
