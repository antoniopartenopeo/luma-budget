import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeApplier } from "@/components/providers/theme-applier";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NUMA Budget",
  description: "Gestisci le tue finanze con semplicità",
  icons: {
    icon: "/brand/numa-logo-smart.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ThemeApplier />
          <AppShell>{children}</AppShell>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
