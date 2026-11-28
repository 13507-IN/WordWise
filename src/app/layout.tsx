import "@fontsource-variable/dm-sans";
import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NavigationProgressBar } from "@/components/navigation-progress";

export const metadata: Metadata = {
  title: {
    default: "LinguaCamp | Prepare for the exam you chose",
    template: "%s | LinguaCamp",
  },
  description:
    "Exam-focused preparation plans and original practice for JLPT, DELE and DALF certifications.",
  applicationName: "LinguaCamp",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
