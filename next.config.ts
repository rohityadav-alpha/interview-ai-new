import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.devtunnels.ms',
        '*.vercel.app', // Add Vercel domains
      ],
    },
  },
  optimizeFonts: true,
  // Add these for production
  images: {
    domains: ['img.clerk.com'], // Clerk profile images
  },
};

export default nextConfig;
