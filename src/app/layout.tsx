import "@fontsource-variable/dm-sans";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { NavigationProgressBar } from "@/components/navigation-progress";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { PwaRegister } from "@/components/pwa-register";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0e3835",
};

export const metadata: Metadata = {
  title: {
    default: "LinguaCamp | Prepare for the exam you chose",
    template: "%s | LinguaCamp",
  },
  description:
    "Exam-focused preparation plans and original practice for JLPT, DELE and DALF certifications with authentic pronunciation and AI tutoring.",
  applicationName: "LinguaCamp",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LinguaCamp",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <PwaRegister />
        {children}
        <PwaInstallBanner />
      </body>
    </html>
  );
}
