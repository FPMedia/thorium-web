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
import { getAllBooks, getBookById } from "@/config/books";
import { usePurchases } from "@/hooks/usePurchases";

// Convert books from index to format expected by PublicationGrid
const books = getAllBooks().map((book) => ({
  title: book.title,
  author: book.author,
  cover: book.cover,
  url: `/read/${book.routeIdentifier}`,
  description: book.description,
  bookId: book.id, // Add bookId for purchase functionality
}));

const onlineBooks: Publication[] = [];

const webPublications: Publication[] = [];

export default function Home() {
  const [isManifestEnabled, setIsManifestEnabled] = useState<boolean>(true);
  const { user, loading: authLoading } = useAuth();
  const { purchases, loading: purchasesLoading } = usePurchases({ status: "completed" });

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
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Investigative journalism and thought-provoking narratives. 
            Read Nicole Barlow&apos;s published works directly in your browser.
          </p>
          
          {/* Auth CTA Section */}
          {!authLoading && (
            <div className="mt-8">
              {!user ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-0">
                    To read books:
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

      {/* Books Section */}
      <section id="books" className="bg-gray-50 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2 text-center">
            Available Books
          </h2>
          <p className="text-gray-600 text-center mb-8 sm:mb-12">
            Click on a book to start reading
          </p>
          
          {/* Purchase Status Message */}
          {!authLoading && !purchasesLoading && user && (
            <div className="mb-8 sm:mb-12">
              {(() => {
                const allBookIds = books.map(book => book.bookId).filter((id): id is string => !!id);
                const ownedBookIds = new Set(
                  purchases.map(purchase => purchase.bookId).filter((id): id is string => !!id)
                );
                const ownedBooks = allBookIds
                  .filter(bookId => ownedBookIds.has(bookId))
                  .map(bookId => {
                    const book = getBookById(bookId);
                    const bookData = books.find(b => b.bookId === bookId);
                    return book && bookData ? { ...book, url: bookData.url } : null;
                  })
                  .filter((book): book is NonNullable<typeof book> => !!book);
                const totalBooks = allBookIds.length;
                const ownedCount = ownedBooks.length;

                if (ownedCount === 0) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 sm:p-8 text-center">
                      <p className="text-base sm:text-lg text-blue-900 mb-4">
                        You haven&apos;t purchased any books yet.
                      </p>
                      <p className="text-sm sm:text-base text-blue-700 mb-4">
                        Browse the books below and click &quot;Purchase&quot; to add them to your library.
                      </p>
                      <a
                        href="#books"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                      >
                        Browse Books
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
                            d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                          />
                        </svg>
                      </a>
                    </div>
                  );
                } else if (ownedCount === totalBooks) {
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8 text-center">
                      <p className="text-base sm:text-lg text-green-900 font-medium mb-2">
                        🎉 Congratulations! You have purchased all available books.
                      </p>
                      <p className="text-sm sm:text-base text-green-700 mb-6">
                        You can access all {totalBooks} book{totalBooks !== 1 ? 's' : ''} in your library.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        {ownedBooks.map(book => (
                          <Link
                            key={book.id}
                            href={book.url as any}
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer text-sm sm:text-base"
                          >
                            Read {book.title}
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
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 sm:p-8">
                      <p className="text-base sm:text-lg text-cyan-900 font-medium mb-3">
                        Your Library ({ownedCount} of {totalBooks} books)
                      </p>
                      <p className="text-sm sm:text-base text-cyan-700 mb-4">
                        You have purchased:
                      </p>
                      <div className="space-y-3 mb-6">
                        {ownedBooks.map(book => (
                          <div
                            key={book.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg p-4 border border-cyan-100"
                          >
                            <div className="mb-2 sm:mb-0">
                              <p className="text-sm sm:text-base font-medium text-cyan-900">
                                {book.title}
                              </p>
                            </div>
                            <Link
                              href={book.url as any}
                              className="inline-flex items-center justify-center px-5 py-2 bg-cyan-600 text-white font-medium rounded-full hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
                            >
                              Read Now
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
                            </Link>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-cyan-200">
                        <p className="text-sm sm:text-base text-cyan-700 mb-3">
                          Continue building your library:
                        </p>
                        <a
                          href="#books"
                          className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-full hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer"
                        >
                          Browse More Books
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
                              d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          )}
          
          <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20">
            {books.map((book, index) => (
              <BookCard
                key={book.bookId}
                title={book.title}
                author={book.author}
                cover={book.cover}
                url={book.url}
                description={book.description}
                bookId={book.bookId}
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
            Nicole Barlow is South Africa&apos;s foremost independent investigative journalist, 
            known for her fearless reporting and dedication to uncovering the truth. 
            Her published works reflect years of meticulous research and a commitment 
            to holding power accountable.
          </p>
          <a
            href="https://nicolebarlow.co.za"
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

        {/* Footer */}
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
