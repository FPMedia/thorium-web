"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Types
interface NavItem {
  title: string;
  href: string;
  excerpt: string;
}

type ScrollDirection = "up" | "down";

// Navigation items configuration for books subdomain
const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    excerpt: "Browse Nicole Barlow's published works and digital library...",
  },
  {
    title: "Books",
    href: "/#books",
    excerpt: "Explore the collection of investigative publications and books...",
  },
  {
    title: "About",
    href: "/#about",
    excerpt: "Learn about Nicole Barlow's journey as an author and journalist...",
  },
  {
    title: "Main Site",
    href: "https://nicolebarlow.co.za",
    excerpt: "Visit the main website for podcasts, articles, and more...",
  },
];

// Custom ease-out cubic function for smooth scrolling
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// Smooth scroll animation
const animateScroll = (
  startY: number,
  targetY: number,
  duration: number
): void => {
  const startTime = performance.now();

  const animate = (currentTime: number): void => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeOutCubic(progress);

    window.scrollTo(0, startY + (targetY - startY) * easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Scroll to element by ID
const scrollToElementId = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const startY = window.pageYOffset;
  const targetY = rect.top + window.pageYOffset;

  animateScroll(startY, targetY, 650);
};

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("up");
  const [shouldPulse, setShouldPulse] = useState(true);
  const lastScrollY = useRef(0);
  const pulseCount = useRef(0);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Pulse animation on load (3 pulses)
  useEffect(() => {
    if (shouldPulse && pulseCount.current < 3) {
      const timer = setTimeout(() => {
        pulseCount.current += 1;
        if (pulseCount.current >= 3) {
          setShouldPulse(false);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [shouldPulse]);

  // Handle navigation click
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
      // Check if it's an anchor link
      if (href.startsWith("/#")) {
        e.preventDefault();
        const elementId = href.substring(2);
        scrollToElementId(elementId);
        setIsMenuOpen(false);
      } else if (href.startsWith("/")) {
        // Internal link - close menu
        setIsMenuOpen(false);
      } else {
        // External link - close menu
        setIsMenuOpen(false);
      }
    },
    []
  );

  // Close menu on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (e.target === e.currentTarget) {
        setIsMenuOpen(false);
      }
    },
    []
  );

  // Toggle menu
  const toggleMenu = useCallback((): void => {
    setIsMenuOpen((prev) => !prev);
    setShouldPulse(false);
  }, []);

  return (
    <>
      {/* Floating Logo - Top Left */}
      <div
        className={`fixed top-4 left-4 z-50 bg-white backdrop-blur-sm p-2 rounded-lg transition-all duration-300 ${
          isMenuOpen
            ? "opacity-0 -translate-y-4"
            : isScrolled && scrollDirection === "down"
            ? "opacity-90 scale-95"
            : "opacity-100 scale-100"
        }`}
      >
        <Link href="/">
          <Image
            src="/images/nicole_barlow_logo_final.svg"
            alt="Nicole Barlow"
            width={96}
            height={96}
            className="h-24 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Menu Toggle Button - Top Right */}
      <button
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        className={`fixed top-4 right-4 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-sm shadow-xl ring-2 ring-cyan-500 flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
          shouldPulse ? "animate-pulse-cyan" : ""
        }`}
      >
        <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-6 h-6 transition-transform duration-300 ${
            isMenuOpen ? "rotate-90" : ""
          }`}
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {/* Full-Screen Menu Overlay */}
      <div
        onClick={handleBackdropClick}
        className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-300 ${
          isMenuOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Menu Card */}
        <div
          className={`relative z-50 w-full max-w-2xl mx-4 bg-white/98 backdrop-blur-sm rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto transition-all duration-300 ${
            isMenuOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          }`}
        >
          <nav>
            <ul className="divide-y divide-gray-200">
              {navItems.map((item, index) => {
                const isExternal = item.href.startsWith("http");
                const linkClassName = "block px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 transition-colors duration-200 hover:text-cyan-600 hover:bg-gray-50";
                const content = (
                  <>
                    <span className="block text-lg sm:text-xl font-bold text-black group-hover:text-cyan-600">
                      {item.title}
                    </span>
                    <span className="block text-xs sm:text-sm text-gray-600 mt-1">
                      {item.excerpt}
                    </span>
                  </>
                );

                return (
                  <li key={index}>
                    {isExternal ? (
                      <a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClassName}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        href={item.href as any}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={linkClassName}
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Navigation;
