import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default nextConfig;
  