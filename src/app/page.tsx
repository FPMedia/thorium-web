"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicationGrid, type Publication } from "@/components/PublicationGrid";
import { Navigation } from "@/components/Navigation";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useAuth } from "@/lib/auth/AuthContext";
import Image from "next/image";
import { BookCard } from "@/components/BookCard";

import { isManifestRouteEnabled } from "./ManifestRouteEnabled";
import { getAllBooks } from "@/config/books";

const books = getAllBooks().map((book) => ({
  title: book.title,
  author: book.author,
  cover: book.cover,
  url: `/read/${book.routeIdentifier}`,
  description: book.description,
  bookId: book.id,
}));

const onlineBooks: Publication[] = [];

const webPublications: Publication[] = [];

export default function Home() {
  const [isManifestEnabled, setIsManifestEnabled] = useState<boolean>(true);
  const { user, loading: authLoading } = useAuth();

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
      <Navigation />
      <ScrollToTop />
      
      <main className="min-h-screen">
      <header className="pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-24 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Nicole Barlow <em>Publications</em>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Investigative journalism and thought-provoking narratives. 
            Read Nicole Barlow&apos;s published works directly in your browser.
          </p>
          
          {!authLoading && (
            <div className="mt-8">
              {!user ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-0">
                    Sign in to read books:
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-full hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-cyan-600 text-cyan-600 font-medium rounded-full hover:bg-cyan-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm sm:text-base text-gray-700 mb-4">
                    Welcome back! Browse the books below to start reading.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <section id="books" className="bg-gray-50 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2 text-center">
            Available Books
          </h2>
          <p className="text-gray-600 text-center mb-8 sm:mb-12">
            {user ? "Click a book to start reading" : "Create a free account to read"}
          </p>
          
          <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20">
            {books.map((book, index) => (
              <BookCard
                key={book.bookId}
                title={book.title}
                author={book.author}
                cover={book.cover}
                url={book.url}
                description={book.description}
                imagePosition={index % 2 === 0 ? "left" : "right"}
              />
            ))}
          </div>
          {webPublications.length > 0 && (
            <div className="mt-12">
              <PublicationGrid
                publications={webPublications}
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
          )}
        </div>
      </section>

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

      <section id="about" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">
            About the Author
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
            Nicole Barlow is South Africa&apos;s foremost independent investigative journalist, 
            known for her fearless reporting and dedication to uncovering the truth. 
            Her published works reflect years of meticulous research and a commitment 
            to holding power accountable.
          </p>
          <a
            href="https://www.nicole-barlow.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-medium rounded-full hover:bg-cyan-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer"
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

        <footer className={`py-8 px-4 sm:px-6 lg:px-8 ${user ? 'border-t border-gray-200' : ''}`}>
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
