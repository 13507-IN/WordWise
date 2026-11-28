"use client";

import { useEffect } from "react";

/**
 * Automatically registers the Service Worker for Progressive Web App (PWA) functionality.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Only register over HTTPS or localhost
    const isLocalhost = Boolean(
      window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    if (window.location.protocol === "https:" || isLocalhost) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) return;
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.info("[PWA] New content is available; please refresh.");
                  } else {
                    console.info("[PWA] Content is cached for offline use.");
                  }
                }
              };
            };
          })
          .catch((error) => {
            console.warn("[PWA] ServiceWorker registration failed: ", error);
          });
      });
    }
  }, []);

  return null;
}
