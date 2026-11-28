"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Triggers the top navigation progress bar programmatically.
 * Useful for auth redirects, form submissions, and programmatic router.push/replace calls.
 */
export function startNavigationProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("navigation-start"));
  }
}

/**
 * Completes the top navigation progress bar programmatically.
 */
export function completeNavigationProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("navigation-complete"));
  }
}

/**
 * High-performance top progress bar.
 * Fires instantly on any internal link click, router navigation, or auth redirect,
 * and finishes smoothly on route change.
 */
export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  // Complete loading when pathname or searchParams change
  useEffect(() => {
    const currentUrl = `${pathname}?${searchParams.toString()}`;
    if (prevUrlRef.current !== null && prevUrlRef.current !== currentUrl) {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);

      const hideTimer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);

      prevUrlRef.current = currentUrl;
      return () => clearTimeout(hideTimer);
    }
    prevUrlRef.current = currentUrl;
  }, [pathname, searchParams]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  function startLoading() {
    setIsLoading(true);
    setProgress(28); // Immediate jump on click/navigation for instant visual feedback

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + 18;
        if (prev < 88) return prev + 6;
        if (prev < 96) return prev + 1;
        return prev;
      });
    }, 140);

    // Safety timeout to reset after 8s if route never resolves
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }, 8000);
  }

  function finishLoading() {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200);
  }

  // Intercept all internal navigation link clicks, popstate, and programmatic history changes
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

        // Internal navigation starting - show top progress bar immediately
        startLoading();
      } catch {
        // Invalid URL, ignore
      }
    }

    function handlePopState() {
      startLoading();
    }

    function handleCustomStart() {
      startLoading();
    }

    function handleCustomComplete() {
      finishLoading();
    }

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("navigation-start", handleCustomStart);
    window.addEventListener("navigation-complete", handleCustomComplete);

    // Monkey-patch history to capture programmatic router pushes and replaces
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const url = args[2];
      if (url && typeof url === "string") {
        try {
          const nextUrl = new URL(url, window.location.href);
          if (nextUrl.pathname !== window.location.pathname || nextUrl.search !== window.location.search) {
            startLoading();
          }
        } catch {
          startLoading();
        }
      }
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      const url = args[2];
      if (url && typeof url === "string") {
        try {
          const nextUrl = new URL(url, window.location.href);
          if (nextUrl.pathname !== window.location.pathname || nextUrl.search !== window.location.search) {
            startLoading();
          }
        } catch {
          startLoading();
        }
      }
      return originalReplaceState.apply(this, args);
    };

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("navigation-start", handleCustomStart);
      window.removeEventListener("navigation-complete", handleCustomComplete);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
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
  );
}
