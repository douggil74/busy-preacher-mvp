/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false, // ✅ restore normal Next.js image behavior
    formats: ['image/webp', 'image/avif'],
  },

  // Remove console logs in production for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', 'jspdf', '@radix-ui/react-dialog'],
  },
  serverExternalPackages: ['firebase-admin'],

  // Exclude firebase-admin from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase-admin': false,
        '@/lib/firebase-admin': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
