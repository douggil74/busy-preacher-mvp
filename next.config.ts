import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // NO output: 'export' - this is for Vercel web deployment
  
  reactStrictMode: true,
  
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;
