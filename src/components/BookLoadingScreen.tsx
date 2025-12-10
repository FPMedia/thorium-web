"use client";

import { useEffect, useState } from "react";
import readerLoaderStyles from "./assets/styles/readerLoader.module.css";
import { useI18n } from "@/i18n/useI18n";
import { LoadingPhase } from "@/lib/readerReducer";

interface BookLoadingScreenProps {
  progress: number; // 0-100
  phase: LoadingPhase;
}

const phaseMessages: Record<LoadingPhase, string> = {
  "fetching-manifest": "Loading book information...",
  "initializing-publication": "Preparing your book...",
  "fetching-positions": "Loading book content...",
  "initializing-navigator": "Setting up reader...",
  "ready": "Almost ready..."
};

export const BookLoadingScreen = ({ progress, phase }: BookLoadingScreenProps) => {
  const { t } = useI18n();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = Math.max(0, Math.min(100, progress));
    
    // Animate progress bar
    const duration = 300; // ms
    const startProgress = animatedProgress;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - t, 3);
      const current = startProgress + (targetProgress - startProgress) * easeOut;
      
      setAnimatedProgress(current);
      
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedProgress(targetProgress);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, animatedProgress]);

  // Update display progress with slight delay for smoother feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(animatedProgress);
    }, 50);
    return () => clearTimeout(timer);
  }, [animatedProgress]);

  const message = phaseMessages[phase] || t("reader.app.loading");

  return (
    <div className={readerLoaderStyles.readerLoaderWrapper}>
      <div className={readerLoaderStyles.bookLoadingScreen}>
        <div className={readerLoaderStyles.loadingContent}>
          {/* Book icon or animation */}
          <div className={readerLoaderStyles.bookIcon}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="12"
                y="8"
                width="40"
                height="48"
                rx="2"
                fill="currentColor"
                opacity="0.2"
              />
              <rect
                x="12"
                y="8"
                width="40"
                height="48"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="32"
                y1="8"
                x2="32"
                y2="56"
                stroke="currentColor"
                strokeWidth="2"
              />
              {/* Animated page turning effect */}
              <g className={readerLoaderStyles.pageTurn}>
                <path
                  d="M 32 8 L 52 8 L 52 56 L 32 56 Z"
                  fill="currentColor"
                  opacity="0.1"
                />
              </g>
            </svg>
          </div>

          {/* Loading message */}
          <h2 className={readerLoaderStyles.loadingTitle}>{message}</h2>

          {/* Progress bar */}
          <div className={readerLoaderStyles.progressContainer}>
            <div className={readerLoaderStyles.progressBar}>
              <div
                className={readerLoaderStyles.progressFill}
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            <div className={readerLoaderStyles.progressText}>
              {Math.round(displayProgress)}%
            </div>
          </div>

          {/* Loading dots animation */}
          <div className={readerLoaderStyles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

