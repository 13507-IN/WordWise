import "@fontsource-variable/dm-sans";
import "./globals.css";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
