import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // NO output: 'export' for Vercel!
  
  reactStrictMode: true,
  
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;