import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { LARSSH_BRAND } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: LARSSH_BRAND.name, template: `%s | ${LARSSH_BRAND.name}` },
  description: `${LARSSH_BRAND.name} — ${LARSSH_BRAND.tagline}. Premium property intelligence, market analytics, and advisory workflows.`,
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  applicationName: LARSSH_BRAND.name,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-svh font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
