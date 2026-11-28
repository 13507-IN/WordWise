"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Check if user previously dismissed prompt
    const dismissed = localStorage.getItem("linguacamp_pwa_dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Suppress for 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Android/Chrome beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // iOS detection (Safari on iOS doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari) {
      // Delay showing banner slightly on iOS for smooth entrance
      const timer = setTimeout(() => {
        setIsIos(true);
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn("Install prompt error:", err);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    try {
      localStorage.setItem("linguacamp_pwa_dismissed", String(Date.now()));
    } catch {
      // Ignore
    }
  }

  if (!showBanner) return null;

  return (
    <aside className="pwa-install-banner" aria-label="Install LinguaCamp App">
      <div className="pwa-banner-content">
        <div className="pwa-banner-icon">
          <Image src="/icons/icon-192.png" alt="" width={38} height={38} unoptimized />
        </div>
        <div className="pwa-banner-text">
          <strong>Install LinguaCamp</strong>
          <span>
            {isIos
              ? "Tap Share ⎋ then 'Add to Home Screen' for the native mobile app experience."
              : "Install as a native app for fast offline access and exam practice."}
          </span>
        </div>
      </div>

      <div className="pwa-banner-actions">
        {deferredPrompt && (
          <button
            type="button"
            className="pwa-install-btn"
            onClick={handleInstallClick}
          >
            <Download size={14} aria-hidden="true" />
            <span>Install</span>
          </button>
        )}
        {isIos && (
          <span className="pwa-ios-hint">
            <Share size={13} aria-hidden="true" /> Share &gt; Add to Home
          </span>
        )}
        <button
          type="button"
          className="pwa-close-btn"
          onClick={handleDismiss}
          aria-label="Dismiss app install banner"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
