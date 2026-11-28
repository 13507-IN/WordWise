"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPill, setShowPill] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pillTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Complete loading when pathname or searchParams change
  useEffect(() => {
    if (isLoading) {
      setProgress(100);
      const doneTimeout = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setShowPill(false);
      }, 250);
      return () => clearTimeout(doneTimeout);
    }
  }, [pathname, searchParams]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pillTimerRef.current) clearTimeout(pillTimerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  function startLoading() {
    setIsLoading(true);
    setProgress(15);

    // Show floating pill if navigation takes more than 120ms
    if (pillTimerRef.current) clearTimeout(pillTimerRef.current);
    pillTimerRef.current = setTimeout(() => {
      setShowPill(true);
    }, 120);

    // Incrementally step progress
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 60) return prev + 15;
        if (prev < 85) return prev + 5;
        if (prev < 95) return prev + 1;
        return prev;
      });
    }, 180);

    // Safety timeout to reset after 10s if route never changes
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      setShowPill(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }, 10000);
  }

  // Intercept all internal navigation link clicks
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Ignore right clicks or modified clicks (Ctrl, Cmd, Shift, Alt)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // Find closest anchor tag
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, downloads, or target="_blank"
      if (
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // Ignore hash links on the same page (#programs, #method, etc.)
      if (href.startsWith("#")) return;

      // Check destination URL vs current location
      try {
        const dest = new URL(href, window.location.href);
        const current = window.location;

        // Same URL with just a hash change? Ignore
        if (dest.pathname === current.pathname && dest.search === current.search) {
          if (dest.hash) return;
        }

        // Internal navigation starting
        startLoading();
      } catch {
        // invalid URL, ignore
      }
    }

    function handlePopState() {
      startLoading();
    }

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* Top Gradient Progress Bar */}
      <div
        className="nav-progress-bar"
        style={{
          width: `${progress}%`,
          opacity: isLoading ? 1 : 0,
        }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Floating Centered Transition Indicator */}
      {showPill && (
        <div className="nav-progress-spinner-pill" role="status" aria-live="polite">
          <span className="nav-inline-spinner" aria-hidden="true" />
          <span>Loading page...</span>
        </div>
      )}
    </>
  );
}
