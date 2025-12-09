"use client";

import Link from "next/link";
import Image from "next/image";
import { PurchaseButton } from "./PurchaseButton";
import { useAuth } from "@/lib/auth/AuthContext";

interface BookCardProps {
  title: string;
  author: string;
  cover: string;
  url: string;
  description?: string;
  bookId?: string;
  imagePosition?: "left" | "right";
}

export function BookCard({
  title,
  author,
  cover,
  url,
  description,
  bookId,
  imagePosition = "left",
}: BookCardProps) {
  const { user } = useAuth();
  
  const isImageRight = imagePosition === "right";
  
  return (
    <div className={`flex flex-col sm:flex-row bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden ${isImageRight ? 'sm:flex-row-reverse' : ''}`}>
      <Link href={url} className="flex-shrink-0 cursor-pointer sm:w-1/3">
        <Image
          src={cover}
          alt={title}
          width={400}
          height={600}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-col flex-grow p-6 sm:p-8 lg:p-10 sm:w-2/3 justify-between">
        <Link href={url} className="flex-grow cursor-pointer">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 hover:text-cyan-600 transition-colors">
            {title}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-4 sm:mb-6">{author}</p>
          {description && (
            <p className="text-gray-500 text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose">{description}</p>
          )}
        </Link>
        {bookId && (
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            {user ? (
              <PurchaseButton bookId={bookId} className="w-full sm:w-auto" />
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-0 sm:mr-2">
                  To purchase this book:
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-full hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer text-sm sm:text-base"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-cyan-600 text-cyan-600 font-medium rounded-full hover:bg-cyan-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer text-sm sm:text-base"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

