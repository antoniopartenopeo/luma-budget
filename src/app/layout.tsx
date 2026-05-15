import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AppRuntimeGate } from "@/components/providers/app-runtime-gate";

const ENABLE_VERCEL_ANALYTICS = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function resolveMetadataBase(): URL {
  const candidate =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NUMA_APP_URL ??
    "http://localhost:3000";

  try {
    return new URL(candidate);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  title: "NUMA Budget",
  description: "App per capire cosa resta nel mese prima di aggiungere una nuova spesa.",
  applicationName: "NUMA Budget",
  metadataBase: resolveMetadataBase(),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/pwa/icon-192-v3.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512-v3.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/pwa/apple-touch-icon-v3.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NUMA Budget",
  },
  openGraph: {
    type: "website",
    siteName: "NUMA Budget",
    title: "NUMA Budget | Sai cosa puoi fare prima di spendere",
    description: "Metti in ordine movimenti, spese e decisioni prima di dire sì.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUMA Budget | Sai cosa puoi fare prima di spendere",
    description: "Metti in ordine movimenti, spese e decisioni prima di dire sì.",
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5a8",
};

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
        <AppRuntimeGate>{children}</AppRuntimeGate>
        {ENABLE_VERCEL_ANALYTICS ? <Analytics /> : null}
      </body>
    </html>
  );
}
