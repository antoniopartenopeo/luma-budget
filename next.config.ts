import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
