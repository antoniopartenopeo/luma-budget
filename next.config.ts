import type { NextConfig } from "next";
import packageJson from "./package.json";

const nextConfig: NextConfig = {
  env: {
    // Single source of truth for app version exposed to client diagnostics.
    NEXT_PUBLIC_APP_VERSION: packageJson.version ?? "unknown",
    NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString(),
    NEXT_PUBLIC_GIT_SHA:
      process.env.NEXT_PUBLIC_GIT_SHA ??
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
      process.env.GIT_COMMIT_SHA?.slice(0, 7) ??
      "local",
  },
  async redirects() {
    return []
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
