import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeApplier } from "@/components/providers/theme-applier";
import { PwaRegister } from "@/components/providers/pwa-register";
import { Toaster } from "sonner";
import { RouteShell } from "@/components/layout/route-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NUMA Budget",
  description: "App locale-first per capire spese, margine, insight e scenari senza dipendere dal cloud.",
  applicationName: "NUMA Budget",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NUMA Budget",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5a8",
};

import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ThemeApplier />
          <PwaRegister />
          <a
            href="#main-content"
            className="sr-only fixed left-4 top-4 z-[100] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            Vai al contenuto
          </a>
          <TooltipProvider delayDuration={300}>
            <RouteShell>{children}</RouteShell>
            <Toaster />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
