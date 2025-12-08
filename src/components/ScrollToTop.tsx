"use client";

import { useState, useEffect, useCallback } from "react";

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

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = (): void => {
      setIsVisible(window.scrollY > 240);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check initial scroll position
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top handler
  const scrollToTop = useCallback((): void => {
    const startY = window.pageYOffset;
    animateScroll(startY, 0, 600);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed left-4 bottom-4 z-50 h-12 w-12 rounded-full bg-cyan-500 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 15.75l7.5-7.5 7.5 7.5"
        />
      </svg>
    </button>
  );
}

export default ScrollToTop;
