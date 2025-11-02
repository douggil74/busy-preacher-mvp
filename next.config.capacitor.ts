import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // Only for Capacitor builds
  
  images: {
    unoptimized: true,
  },
  
  trailingSlash: true,
  
  reactStrictMode: true,
};

export default nextConfig;
