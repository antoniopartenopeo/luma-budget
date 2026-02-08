import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.npm_package_version ?? "unknown",
    NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString(),
    NEXT_PUBLIC_GIT_SHA:
      process.env.NEXT_PUBLIC_GIT_SHA ??
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
      process.env.GIT_COMMIT_SHA?.slice(0, 7) ??
      "local",
  },
  async redirects() {
    return [
      {
        source: '/budget',
        destination: '/',
        permanent: true,
      },
      // Legacy Goals Lab redirect (Safe fallback to home)
      {
        source: '/goals/lab',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
