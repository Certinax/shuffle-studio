import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppHeader } from "@/components/shell/app-header";
import { GradientBackground } from "@/components/shell/gradient-background";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const appUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://shuffle-studio-smoky.vercel.app");

const title = "Shuffle Studio";
const description = "Create beautifully shuffled Spotify playlists from your own catalog.";
const socialPreviewImage = "/og-image.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: title,
    template: "%s | Shuffle Studio",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    images: [
      {
        url: socialPreviewImage,
        width: 1200,
        height: 630,
        alt: "Shuffle Studio green shuffle icon on a dark gradient background",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialPreviewImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <GradientBackground />
        <div className="flex min-h-dvh flex-col">
          <AppHeader />
          {children}
        </div>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
